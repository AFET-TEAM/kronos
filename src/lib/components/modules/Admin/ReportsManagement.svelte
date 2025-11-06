<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../ui/Button/Button.svelte";
  import Input from "../../ui/Input/Input.svelte";
  import {
    getAllReports,
    type AdminReport,
  } from "$lib/services/admin.service.js";
  import { goto } from "$app/navigation";

  let reports: AdminReport[] = [];
  let filteredReports: AdminReport[] = [];
  let loading = true;
  let searchQuery = "";

  onMount(async () => {
    await loadReports();
  });

  async function loadReports() {
    loading = true;
    try {
      reports = await getAllReports();
      filteredReports = reports;
    } catch (error) {
      console.error("Raporlar yüklenemedi:", error);
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      filteredReports = reports;
      return;
    }

    const query = searchQuery.toLowerCase();
    filteredReports = reports.filter(
      (report) =>
        report.user.firstName.toLowerCase().includes(query) ||
        report.user.lastName.toLowerCase().includes(query) ||
        report.user.email.toLowerCase().includes(query) ||
        report.title.toLowerCase().includes(query)
    );
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <button
        on:click={() => window.history.back()}
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        aria-label="Geri"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Rapor Yönetimi
      </h1>
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div class="flex gap-4">
      <Input
        bind:value={searchQuery}
        placeholder="Rapor veya kullanıcı ara..."
        type="text"
        className="flex-1"
      />
      <Button onClick={handleSearch} text="Ara" variant="primary" />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    {#if loading}
      <div class="p-8 text-center text-gray-500 dark:text-gray-400">
        Yükleniyor...
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Kullanıcı
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Rapor
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Tarih Aralığı
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Task Sayısı
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Oluşturulma
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each filteredReports as report}
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <img
                      src={report.user.avatarUrl}
                      alt={`${report.user.firstName} ${report.user.lastName}`}
                      class="w-10 h-10 rounded-full ring-2 ring-indigo-400"
                      loading="lazy"
                    />
                    <div>
                      <div class="font-semibold text-gray-900 dark:text-white">
                        {report.user.firstName}
                        {report.user.lastName}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {report.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {report.title}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {report.startDate} - {report.endDate}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {report.taskCount}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {formatDate(report.createdAt)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Button
                    onClick={() => goto(`/archive/${report.id}`)}
                    text="Görüntüle"
                    variant="secondary"
                    size="small"
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if filteredReports.length === 0}
        <div class="p-8 text-center text-gray-500 dark:text-gray-400">
          Rapor bulunamadı
        </div>
      {/if}
    {/if}
  </div>
</div>
