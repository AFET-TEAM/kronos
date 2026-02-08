<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import {
    getReportDetails,
    downloadReportPdf,
    type ReportDetails,
  } from "$lib/services/reportService.js";
  import { getErrorMessage } from "$lib/services/errorHandler.js";

  let isSidebarOpen = true;
  let reportDetails: ReportDetails | null = null;
  let loading = true;
  let reportId: string;
  let expandedDays: Set<number> = new Set();
  let errorMessage = "";
  let filterDate: string | null = null; // Sadece bu günü göster

  $: reportId = $page.params.reportId;
  $: {
    // Query parameter'dan date'i al
    const urlParams = new URLSearchParams(window.location.search);
    filterDate = urlParams.get('date');
  }

  onMount(() => {
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
    loadReportDetails();
  });

  async function loadReportDetails() {
    loading = true;
    errorMessage = "";
    console.log("[Archive Detail] Loading report with ID:", reportId);
    try {
      reportDetails = await getReportDetails(reportId);
      console.log("[Archive Detail] Report loaded:", reportDetails ? "Success" : "Null");
      if (!reportDetails) {
        errorMessage = "Rapor bulunamadı";
        console.warn("[Archive Detail] Report not found, redirecting to archive...");
        // Don't redirect immediately, show error message
        setTimeout(() => {
          goto("/archive");
        }, 2000);
      } else {
        // Eğer filterDate varsa, sadece o günü aç
        if (filterDate) {
          const dayIndex = reportDetails.dailyReports.findIndex(
            (daily) => daily.date === filterDate
          );
          if (dayIndex !== -1) {
            expandedDays = new Set([dayIndex]);
          }
        } else {
          expandedDays = new Set(
            reportDetails.dailyReports.map((_, index) => index)
          );
        }
      }
    } catch (error) {
      errorMessage = getErrorMessage(error);
      console.error("[Archive Detail] Error loading report details:", error);
      // Show error for 2 seconds before redirecting
      setTimeout(() => {
        goto("/archive");
      }, 2000);
    } finally {
      loading = false;
    }
  }

  async function handleDownloadPdf() {
    try {
      await downloadReportPdf(reportId);
    } catch (error) {
      errorMessage = getErrorMessage(error);
    }
  }

  function goBack() {
    goto("/archive");
  }

  function toggleDay(index: number) {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    expandedDays = newExpanded;
  }
</script>

<svelte:head>
  <title>
    {reportDetails
      ? `Rapor Detayı (${reportDetails.startDate} - ${reportDetails.endDate})`
      : "Rapor Yükleniyor..."} - Kronos
  </title>
  <meta
    name="description"
    content={reportDetails
      ? `${reportDetails.startDate} - ${reportDetails.endDate} - ${reportDetails.user.firstName} ${reportDetails.user.lastName} tarafından hazırlanan haftalık rapor detayları`
      : "Kronos Raporlama Sistemi - Rapor Detayları"}
  />
</svelte:head>

<div class="min-h-screen bg-slate-100 dark:bg-slate-950">
  <Header
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
  />

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-14 pb-12 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <div class="container max-w-4xl mx-auto px-4">
      {#if loading}
        <div class="animate-pulse space-y-6">
          <div class="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-40"></div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
        </div>
      {:else if reportDetails}
        <nav class="mb-8">
          <button
            type="button"
            on:click={goBack}
            class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Arşiv'e Dön
          </button>
        </nav>

        <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Rapor dönemi
            </p>
            <p class="text-xl font-semibold text-gray-900 dark:text-white mt-0.5">
              {reportDetails.startDate} — {reportDetails.endDate}
            </p>
          </div>
          <Button
            onClick={handleDownloadPdf}
            text="PDF İndir"
            className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors"
          />
        </header>

        <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 mb-8">
          <div class="flex items-start gap-5">
            <img
              src={reportDetails.user.avatarUrl}
              alt=""
              width="72"
              height="72"
              class="w-20 h-20 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-600 shrink-0"
            />
            <div class="min-w-0 flex-1 grid gap-y-4 sm:grid-cols-2">
              <div>
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                  İsim — Soyisim
                </p>
                <p class="text-base font-semibold text-gray-900 dark:text-white">
                  {reportDetails.user.firstName} {reportDetails.user.lastName}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                  Ekip
                </p>
                <p class="text-base text-gray-700 dark:text-gray-300">
                  {reportDetails.user.squad || "—"}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                  Direktörlük
                </p>
                <p class="text-base text-gray-700 dark:text-gray-300">
                  {reportDetails.user.department || "—"}
                </p>
              </div>
              <div class="sm:col-span-2">
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                  Mail
                </p>
                <p class="text-base text-gray-700 dark:text-gray-300 break-all">
                  {reportDetails.user.email}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm">
              📅
            </span>
            {filterDate ? `${filterDate} — Günlük detay` : "Günlük detaylar"}
          </h2>

          {#each (filterDate
            ? reportDetails.dailyReports.filter((daily) => daily.date === filterDate)
            : reportDetails.dailyReports) as dayReport, index}
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              <button
                type="button"
                on:click={() => toggleDay(index)}
                class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
              >
                <span class="font-semibold text-gray-900 dark:text-white">
                  {dayReport.day} <span class="text-gray-500 dark:text-gray-400 font-normal">({dayReport.date})</span>
                </span>
                <svg
                  class="w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 {expandedDays.has(index) ? 'rotate-180' : ''}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {#if expandedDays.has(index)}
                <div class="p-5 pt-0 space-y-6 border-t border-gray-100 dark:border-gray-700/50">
                  {#if dayReport.isOnLeave}
                    <div class="rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200/60 dark:border-sky-800/60 p-6 text-center">
                      <span class="text-4xl mb-3 block">🏖️</span>
                      <p class="font-semibold text-sky-700 dark:text-sky-200">Bu gün izinli</p>
                      <p class="text-sm text-sky-600/80 dark:text-sky-300/80 mt-1">İzinli günler için rapor girilmez.</p>
                    </div>
                  {:else if dayReport.tasks.length > 0}
                    <div>
                      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Görevler
                      </h3>
                      <ul class="space-y-3">
                        {#each dayReport.tasks as task}
                          <li class="rounded-xl bg-gray-50 dark:bg-gray-900/60 p-4 border border-gray-100 dark:border-gray-700/50">
                            <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div class="flex flex-wrap items-center gap-2 min-w-0">
                                <span class="font-medium text-gray-900 dark:text-white truncate">{task.taskName}</span>
                                {#if task.status}
                                  <span
                                    class="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium {task.status === 'Tamamlandı'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                                      : task.status === 'Devam Ediyor'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'}"
                                  >
                                    {task.status}
                                  </span>
                                {/if}
                              </div>
                              <span class="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                {task.estimatedHours} saat
                              </span>
                            </div>
                            {#if task.taskNumber}
                              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">{task.taskNumber}</p>
                            {/if}
                            {#if task.description}
                              <p class="text-sm text-gray-700 dark:text-gray-300">{task.description}</p>
                            {/if}
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if !dayReport.isOnLeave && dayReport.untrackedWork}
                    <div>
                      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Görev harici iş
                      </h3>
                      <div class="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/50 p-4">
                        <p class="text-sm text-gray-700 dark:text-gray-300">{dayReport.untrackedWork}</p>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </section>

      {:else if errorMessage}
        <div class="text-center py-12">
          <div class="text-6xl mb-4">⚠️</div>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-2">
            {errorMessage}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Arşiv sayfasına yönlendiriliyorsunuz...
          </p>
          <Button
            onClick={goBack}
            text="Arşiv'e Dön"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          />
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Rapor bulunamadı.
          </p>
          <Button
            onClick={goBack}
            text="Arşiv'e Dön"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          />
        </div>
      {/if}
    </div>
  </main>
</div>
