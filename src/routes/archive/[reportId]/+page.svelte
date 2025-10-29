<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import {
    getReportDetails,
    downloadReportPdf,
    type ReportDetails,
  } from "$lib/services/reportService.js";

  let isSidebarOpen = true;
  let searchValue = "";
  let reportDetails: ReportDetails | null = null;
  let loading = true;
  let reportId: string;
  let expandedDays: Set<number> = new Set();

  $: reportId = $page.params.reportId;

  onMount(() => {
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
    loadReportDetails();
  });

  async function loadReportDetails() {
    loading = true;
    try {
      reportDetails = await getReportDetails(reportId);
      if (!reportDetails) {
        goto("/dashboard");
      } else {
        expandedDays = new Set(
          reportDetails.dailyReports.map((_, index) => index)
        );
      }
    } catch (error) {
      console.error("Rapor detayları yüklenirken hata:", error);
      goto("/dashboard");
    } finally {
      loading = false;
    }
  }

  async function handleDownloadPdf() {
    try {
      await downloadReportPdf(reportId);
    } catch (error) {
      console.error("PDF indirme hatası:", error);
    }
  }

  function goBack() {
    goto("/dashboard");
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
      ? `${reportDetails.title} - Rapor Detayı`
      : "Rapor Yükleniyor..."} - Kronos
  </title>
  <meta
    name="description"
    content={reportDetails
      ? `${reportDetails.title} (${reportDetails.startDate} - ${reportDetails.endDate}) - ${reportDetails.user.firstName} ${reportDetails.user.lastName} tarafından hazırlanan haftalık rapor detayları`
      : "Kronos Raporlama Sistemi - Rapor Detayları"}
  />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header
    theme={$themeStore}
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
    bind:searchValue
  >
    <SearchBar
      placeholder="Rapor ara..."
      bind:value={searchValue}
      icon="search"
      size="medium"
    />
  </Header>

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-16 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <div class="container mx-auto px-4 py-6 max-w-6xl">
      {#if loading}
        <div class="animate-pulse space-y-6">
          <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
            <div class="flex items-center gap-4">
              <div
                class="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full"
              ></div>
              <div class="flex-1 space-y-2">
                <div
                  class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"
                ></div>
                <div
                  class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"
                ></div>
              </div>
            </div>
          </div>
        </div>
      {:else if reportDetails}
        <Button
          onClick={goBack}
          text="← Dashboard'a Dön"
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-transparent border-0"
        />

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {reportDetails.title}
              </h1>
              <p class="text-lg text-gray-600 dark:text-gray-400">
                {reportDetails.startDate} - {reportDetails.endDate}
              </p>
            </div>
            <Button
              onClick={handleDownloadPdf}
              text="📥 PDF İndir"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
            />
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2
              class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4"
            >
              Developer Bilgisi
            </h2>
            <div class="flex items-center gap-4">
              <img
                src={reportDetails.user.avatarUrl}
                alt={`${reportDetails.user.firstName} ${reportDetails.user.lastName}`}
                width="80"
                height="80"
                class="w-20 h-20 rounded-full border-4 border-indigo-500"
              />
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {reportDetails.user.firstName}
                  {reportDetails.user.lastName}
                </h3>
                <p class="text-md text-gray-600 dark:text-gray-400">
                  {reportDetails.user.title}
                </p>
                <p class="text-md text-gray-600 dark:text-gray-400">
                  {reportDetails.user.squad}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {reportDetails.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <h2
            class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <span>📅</span>
            <span>Günlük Detaylar</span>
          </h2>

          {#each reportDetails.dailyReports as dayReport, index}
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <button
                on:click={() => toggleDay(index)}
                class="w-full bg-indigo-600 dark:bg-indigo-700 px-6 py-4 flex items-center justify-between hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                <h3 class="text-xl font-bold text-white">
                  {dayReport.day} ({dayReport.date})
                </h3>
                <svg
                  class="w-6 h-6 text-white transition-transform duration-200 {expandedDays.has(
                    index
                  )
                    ? 'rotate-180'
                    : ''}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {#if expandedDays.has(index)}
                <div class="p-6 space-y-6">
                  {#if dayReport.isOnLeave}
                    <div
                      class="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg p-6 text-center"
                    >
                      <div class="text-5xl mb-3">🏖️</div>
                      <p
                        class="text-xl font-semibold text-sky-700 dark:text-sky-100"
                      >
                        Bu gün izinliyim
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        İzinli günler için rapor girilmez.
                      </p>
                    </div>
                  {:else if dayReport.tasks.length > 0}
                    <div>
                      <h4
                        class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                      >
                        <svg
                          class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Tasklar
                      </h4>
                      <div class="space-y-4">
                        {#each dayReport.tasks as task}
                          <div
                            class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                          >
                            <div class="flex items-start justify-between mb-2">
                              <div>
                                <h5
                                  class="font-semibold text-gray-900 dark:text-white"
                                >
                                  {task.taskName}
                                </h5>
                                <p
                                  class="text-sm text-indigo-600 dark:text-indigo-400"
                                >
                                  {task.taskNumber}
                                </p>
                              </div>
                              <span
                                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                              >
                                {task.estimatedHours} saat
                              </span>
                            </div>
                            <p class="text-gray-700 dark:text-gray-300 text-sm">
                              {task.description}
                            </p>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  {#if dayReport.blockers}
                    <div>
                      <h4
                        class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                      >
                        <svg
                          class="w-5 h-5 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Blokajlar / Sorunlar
                      </h4>
                      <div
                        class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded"
                      >
                        <p class="text-gray-700 dark:text-gray-300">
                          {dayReport.blockers}
                        </p>
                      </div>
                    </div>
                  {/if}

                  {#if dayReport.meetings}
                    <div>
                      <h4
                        class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                      >
                        <svg
                          class="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Toplantılar ve Eğitimler
                      </h4>
                      <div
                        class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded"
                      >
                        <p class="text-gray-700 dark:text-gray-300">
                          {dayReport.meetings}
                        </p>
                      </div>
                    </div>
                  {/if}

                  {#if dayReport.untrackedWork}
                    <div>
                      <h4
                        class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"
                      >
                        <svg
                          class="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Task Harici
                      </h4>
                      <div
                        class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded"
                      >
                        <p class="text-gray-700 dark:text-gray-300">
                          {dayReport.untrackedWork}
                        </p>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <div class="mt-8 flex justify-between items-center">
          <Button
            onClick={goBack}
            text="Geri Dön"
            className="px-5 py-2.5 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
          />
          <Button
            onClick={handleDownloadPdf}
            text="📥 PDF İndir"
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
            text="Dashboard'a Dön"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          />
        </div>
      {/if}
    </div>
  </main>
</div>
