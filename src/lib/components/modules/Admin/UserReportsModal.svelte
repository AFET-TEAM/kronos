<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../ui/Button/Button.svelte";
  import { goto } from "$app/navigation";
  import type { AdminUser } from "$lib/services/admin.service.js";
  import {
    getAdminReports,
    type AdminReport,
  } from "$lib/services/adminReportService.js";
  import { getErrorMessage } from "$lib/services/errorHandler.js";
  import { formatTRDate } from "$lib/utils/dateUtils.js";

  export let user: AdminUser;
  export let onClose: () => void;

  type UserWithReports = AdminUser & {
    recentReports: AdminReport[];
  };

  let userWithReports: UserWithReports | null = null;
  let loading = true;

  onMount(async () => {
    try {
      // Fetch reports for this user
      const response = await getAdminReports({ userId: user.id, limit: 100 });

      userWithReports = {
        ...user,
        recentReports: response.reports,
      };
    } catch (error) {
      // Hata sessizce yoksayılır
      const errorMsg = getErrorMessage(error);
    } finally {
      loading = false;
    }
  });

  function viewReportDetail(reportId: string) {
    goto(`/archive/${reportId}`);
    onClose();
  }

  function getUserDisplayName(u: AdminUser): string {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.email || 'Kullanıcı';
  }

  function getReportDisplayTitle(report: AdminReport): string {
    const raw = report.title || '';
    if (raw.includes('undefined') || !raw.trim()) {
      return `${getUserDisplayName(user)} - Haftalık Rapor`;
    }
    return raw;
  }
</script>

<!-- Modal Overlay -->
<div
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  on:click={onClose}
  on:keydown={(e) => e.key === "Escape" && onClose()}
  role="button"
  tabindex="0"
>
  <!-- Modal Content -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
    on:click|stopPropagation
    role="dialog"
  >
    <!-- Header -->
    <div
      class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-4">
        {#if user.avatarUrl}
          <img
            src={user.avatarUrl}
            alt={getUserDisplayName(user)}
            class="w-12 h-12 rounded-full ring-2 ring-white object-cover"
            on:error={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }}
          />
        {/if}
        <div 
          class="w-12 h-12 rounded-full ring-2 ring-white bg-white/20 flex items-center justify-center text-white font-bold text-lg"
          style="display: {user.avatarUrl ? 'none' : 'flex'};"
        >
          {(() => {
            const f = (user.firstName || '').charAt(0).toUpperCase();
            const l = (user.lastName || '').charAt(0).toUpperCase();
            return (f + l) || (user.email || '?').charAt(0).toUpperCase();
          })()}
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">
            {getUserDisplayName(user)}
          </h2>
          <p class="text-sm text-indigo-100">{user.email}</p>
        </div>
      </div>
      <button
        on:click={onClose}
        class="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
        aria-label="Kapat"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      {#if loading}
        <div class="flex justify-center items-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"
          ></div>
        </div>
      {:else if userWithReports}
        <!-- User Info -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Ünvan</p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {user.title}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Takım</p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {user.squad}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Başlangıç</p>
              <p class="font-semibold text-gray-900 dark:text-white">
                {formatTRDate(user.startDate)}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Toplam Rapor
              </p>
              <p class="font-semibold text-indigo-600 dark:text-indigo-400">
                {userWithReports.recentReports.length}
              </p>
            </div>
          </div>
        </div>

        <!-- Reports List -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Raporlar ({userWithReports.recentReports.length})
          </h3>

          {#if userWithReports.recentReports.length === 0}
            <div
              class="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <svg
                class="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p class="text-gray-500 dark:text-gray-400">
                Henüz rapor bulunmuyor
              </p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each userWithReports.recentReports as report}
                <div
                  class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  on:click={() => viewReportDetail(report.id)}
                  on:keydown={(e) =>
                    e.key === "Enter" && viewReportDetail(report.id)}
                  role="button"
                  tabindex="0"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h4 class="font-semibold text-gray-900 dark:text-white">
                          {getReportDisplayTitle(report)}
                        </h4>
                        <span
                          class="px-2 py-1 rounded-full text-xs font-semibold {report.isReviewed
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}"
                        >
                          {report.isReviewed ? "İncelendi" : "Bekliyor"}
                        </span>
                      </div>
                      <div
                        class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span class="flex items-center gap-1">
                          <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {report.startDate} - {report.endDate}
                        </span>
                        <span class="flex items-center gap-1">
                          <svg
                            class="w-4 h-4"
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
                          {report.taskCount ?? 0} Görev
                        </span>
                        <span class="text-xs">
                          {formatTRDate(report.createdAt)}
                        </span>
                      </div>
                    </div>
                    <svg
                      class="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">
            Kullanıcı bilgileri yüklenemedi
          </p>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div
      class="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50"
    >
      <div class="flex justify-end">
        <Button onClick={onClose} text="Kapat" variant="secondary" />
      </div>
    </div>
  </div>
</div>
