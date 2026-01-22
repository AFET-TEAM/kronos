<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import DailyReportCard from "./DailyReportCard.svelte";
  import WeeklyReportPreview from "./WeeklyReportPreview.svelte";
  import type { DailyReport, ReportDetails } from "$lib/services/reportService.js";
  import { createWeeklyReport, updateWeeklyReport, updateDailyReport, getDailyReportsByDateRange } from "$lib/services/reportService.js";
  import { dailyReportsStore } from "$lib/store/reportStore.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import { getErrorMessage, getValidationErrors } from "$lib/services/errorHandler.js";

  export let isOpen = false;
  export let onClose: () => void;
  export let onReportCreated: (() => void) | undefined = undefined;
  export let reportToEdit: ReportDetails | null = null; // Düzenlenecek rapor

  let showPreview = false;
  let maxEndDate = "";
  let isEditMode = false;
  let isLoadingPreviousReports = false;

  // Bugünün tarihi
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Bu haftanın pazartesi gününü bul ve otomatik olarak ata
  const currentDay = today.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Pazar ise 6, diğerleri için gün - 1
  const thisWeekMonday = new Date(today);
  thisWeekMonday.setDate(today.getDate() - daysFromMonday);
  const mondayStr = thisWeekMonday.toISOString().split("T")[0];

  // Başlangıç tarihi otomatik olarak bu haftanın pazartesi
  let startDate = mondayStr;
  let endDate = "";

  let dailyReports: DailyReport[] = [];
  let hasLoadedReport = false;

  // Modal açıldığında state'leri resetle veya düzenleme modunu başlat
  $: if (isOpen) {
    if (reportToEdit && !hasLoadedReport) {
      // Düzenleme modu
      isEditMode = true;
      loadReportForEditing(reportToEdit);
      hasLoadedReport = true;
    } else if (!reportToEdit) {
      // Yeni rapor oluşturma modu
      isEditMode = false;
      startDate = mondayStr;
      endDate = "";
      dailyReports = [];
      showPreview = false;
      maxEndDate = "";
      hasLoadedReport = false;
    }
  } else {
    hasLoadedReport = false;
  }

  /**
   * Düzenlenecek raporu yükle
   */
  function loadReportForEditing(report: ReportDetails) {
    // Tarihleri DD.MM.YYYY formatından YYYY-MM-DD formatına çevir
    const parseDate = (dateStr: string): string => {
      const [day, month, year] = dateStr.split(".");
      return `${year}-${month}-${day}`;
    };

    startDate = parseDate(report.startDate);
    endDate = parseDate(report.endDate);
    
    // Rapordaki daily reports'ları deep copy ile yükle
    // Svelte reactivity için yeni array oluştur
    dailyReports = report.dailyReports.map(dr => ({
      day: dr.day,
      date: dr.date,
      tasks: dr.tasks.map(t => ({
        taskName: t.taskName || "",
        taskNumber: t.taskNumber || "",
        estimatedHours: t.estimatedHours || 0,
        description: t.description || "",
        status: t.status || "Devam Ediyor"
      })),
      blockers: dr.blockers || "",
      meetings: dr.meetings || "",
      untrackedWork: dr.untrackedWork || "",
      isOnLeave: dr.isOnLeave || false
    }));
    
    showPreview = false;
  }

  const dayNames = [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ];

  function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  /**
   * Tarih aralığındaki günlük raporları backend'den çek ve otomatik doldur
   */
  async function loadPreviousDailyReports(start: string, end: string) {
    try {
      isLoadingPreviousReports = true;

      // Backend'den günlük raporları çek (DD.MM.YYYY formatında)
      const formatForBackend = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-");
        return `${day}.${month}.${year}`;
      };

      const formattedStart = formatForBackend(start);
      const formattedEnd = formatForBackend(end);

      const previousReports = await getDailyReportsByDateRange(formattedStart, formattedEnd);

      // Tarihleri Map'e dönüştür (hızlı erişim için)
      const reportsByDate = new Map<string, DailyReport>();
      previousReports.forEach(report => {
        reportsByDate.set(report.date, report);
      });

      // Günlük raporları oluştur veya doldur
      const startDate = new Date(start);
      const endDate = new Date(end);
      const reports: DailyReport[] = [];

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDate(date);
        const existingReport = reportsByDate.get(dateKey);

        if (existingReport) {
          // Backend'den gelen raporu kullan
          reports.push({
            day: existingReport.day,
            date: existingReport.date,
            tasks: existingReport.tasks.map(t => ({ ...t })),
            blockers: existingReport.blockers || "",
            meetings: existingReport.meetings || "",
            untrackedWork: existingReport.untrackedWork || "",
            isOnLeave: existingReport.isOnLeave || false
          });
        } else {
          // Boş rapor oluştur
          reports.push({
            day: dayNames[date.getDay()],
            date: dateKey,
            tasks: [
              {
                taskName: "",
                taskNumber: "",
                estimatedHours: 0,
                description: "",
                status: "Devam Ediyor",
              },
            ],
            blockers: [],
            meetings: [],
            untrackedWork: "",
            isOnLeave: false,
          });
        }
      }

      dailyReports = reports;

      // Eğer önceden kaydedilmiş raporlar varsa bildirim göster
      if (previousReports.length > 0) {
        toastStore.success(`${previousReports.length} günlük rapor otomatik olarak yüklendi! 🎉`, 3000);
      }
    } catch (error) {
      toastStore.warning("Önceki raporlar yüklenemedi, boş formla devam edebilirsiniz");
      
      // Hata durumunda boş raporlar oluştur
      generateEmptyReports(start, end);
    } finally {
      isLoadingPreviousReports = false;
    }
  }

  /**
   * Boş günlük raporları oluştur (fallback)
   */
  function generateEmptyReports(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const reports: DailyReport[] = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      reports.push({
        day: dayNames[date.getDay()],
        date: formatDate(date),
        tasks: [
          {
            taskName: "",
            taskNumber: "",
            estimatedHours: 0,
            description: "",
            status: "Devam Ediyor",
          },
        ],
        blockers: [],
        meetings: [],
        untrackedWork: "",
        isOnLeave: false,
      });
    }

    dailyReports = reports;
  }

  function generateWeeklyReports() {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const dayDifference = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayDifference > 6) {
      toastStore.warning("Rapor dönemi en fazla 7 gün olabilir!");
      endDate = "";
      return;
    }

    // Düzenleme modundaysa veya zaten dolu raporlar varsa, üzerine yazma
    if (isEditMode || dailyReports.length > 0) {
      return;
    }

    // Backend'den önceki raporları yükle
    loadPreviousDailyReports(startDate, endDate);
  }

  function closeModal() {
    onClose();
  }

  function handlePreview() {
    // Önce validasyon yap
    const validationErrors: string[] = [];
    
    dailyReports.forEach((dayReport) => {
      // İzinli günlerde validasyon yapma
      if (dayReport.isOnLeave) {
        return;
      }

      // Ama eğer blockers, meetings veya untrackedWork varsa, task zorunlu değil
      const hasOtherContent = 
        (Array.isArray(dayReport.blockers) ? dayReport.blockers.length > 0 : (typeof dayReport.blockers === 'string' && dayReport.blockers.trim())) ||
        (Array.isArray(dayReport.meetings) ? dayReport.meetings.length > 0 : (typeof dayReport.meetings === 'string' && dayReport.meetings.trim())) ||
        (dayReport.untrackedWork && dayReport.untrackedWork.trim());

      // Çalışma günlerinde en az bir task olmalı
      // Eğer tasks array'i boşsa veya hiç task yoksa hata ver
      if (!dayReport.tasks || dayReport.tasks.length === 0) {
        if (!hasOtherContent) {
          validationErrors.push(`${dayReport.date} tarihinde en az bir görev eklemelisiniz`);
        }
        return;
      }

      // TaskName'i dolu olan task'ları filtrele (boş task'ları göz ardı et)
      const tasksWithName = dayReport.tasks.filter(
        (t) => t.taskName && t.taskName.trim()
      );

      // Eğer hiçbir task'ın taskName'i yoksa ve başka içerik de yoksa, bu da hata
      if (tasksWithName.length === 0 && !hasOtherContent) {
        validationErrors.push(`${dayReport.date} tarihinde en az bir görev adı girmelisiniz`);
        return;
      }

      // Her task için zorunlu alanları kontrol et (sadece taskName'i olanlar için)
      tasksWithName.forEach((task, taskIndex) => {
        if (!task.taskName || !task.taskName.trim()) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Görev adı zorunludur`);
        }
        if (!task.taskNumber || !task.taskNumber.trim()) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Görev numarası zorunludur`);
        }
        if (task.estimatedHours === undefined || task.estimatedHours === null || task.estimatedHours <= 0) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Süre zorunludur ve 0'dan büyük olmalıdır`);
        }
        if (!task.description || !task.description.trim()) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Açıklama zorunludur`);
        }
        // Status default olarak ayarla eğer yoksa
        if (!task.status) {
          task.status = "Devam Ediyor";
        }
      });
    });

    if (validationErrors.length > 0) {
      toastStore.error(validationErrors[0]);
      if (validationErrors.length > 1) {
        console.error("Validation errors:", validationErrors);
      }
      return;
    }

    // En az bir gün için içerik olmalı (untrackedWork zorunlu değil)
    const hasAnyContent = dailyReports.some(
      (day) =>
        day.isOnLeave ||
        day.tasks.some((t) => t.taskName && t.taskName.trim()) ||
        (Array.isArray(day.blockers)
          ? day.blockers.length > 0
          : (typeof day.blockers === 'string' && day.blockers.trim())) ||
        (Array.isArray(day.meetings)
          ? day.meetings.length > 0
          : (typeof day.meetings === 'string' && day.meetings.trim())) ||
        (day.untrackedWork && day.untrackedWork.trim())
    );

    if (!hasAnyContent) {
      toastStore.warning("Lütfen en az bir gün için veri doldurun");
      return;
    }

    showPreview = true;
  }

  function handleConfirmReport() {
    // Önce validasyon yap
    const validationErrors: string[] = [];
    
    dailyReports.forEach((dayReport, dayIndex) => {
      // İzinli günlerde validasyon yapma
      if (dayReport.isOnLeave) {
        return;
      }

      // Ama eğer blockers, meetings veya untrackedWork varsa, task zorunlu değil
      const hasOtherContent = 
        (Array.isArray(dayReport.blockers) ? dayReport.blockers.length > 0 : (typeof dayReport.blockers === 'string' && dayReport.blockers.trim())) ||
        (Array.isArray(dayReport.meetings) ? dayReport.meetings.length > 0 : (typeof dayReport.meetings === 'string' && dayReport.meetings.trim())) ||
        (dayReport.untrackedWork && dayReport.untrackedWork.trim());

      // Çalışma günlerinde en az bir task olmalı
      // Eğer tasks array'i boşsa veya hiç task yoksa hata ver
      if (!dayReport.tasks || dayReport.tasks.length === 0) {
        if (!hasOtherContent) {
          validationErrors.push(`${dayReport.date} tarihinde en az bir görev eklemelisiniz`);
        }
        return;
      }

      // TaskName'i dolu olan task'ları filtrele (boş task'ları göz ardı et)
      const tasksWithName = dayReport.tasks.filter(
        (t) => t.taskName && t.taskName.trim()
      );

      // Eğer hiçbir task'ın taskName'i yoksa ve başka içerik de yoksa, bu da hata
      if (tasksWithName.length === 0 && !hasOtherContent) {
        validationErrors.push(`${dayReport.date} tarihinde en az bir görev adı girmelisiniz`);
        return;
      }

      // Her task için zorunlu alanları kontrol et (sadece taskName'i olanlar için)
      tasksWithName.forEach((task, taskIndex) => {
        if (!task.taskName || !task.taskName.trim()) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Görev adı zorunludur`);
        }
        if (!task.taskNumber || !task.taskNumber.trim()) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Görev numarası zorunludur`);
        }
        if (task.estimatedHours === undefined || task.estimatedHours === null || task.estimatedHours <= 0) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Süre zorunludur ve 0'dan büyük olmalıdır`);
        }
        if (!task.description || !task.description.trim()) {
          validationErrors.push(`${dayReport.date} - Task ${taskIndex + 1}: Açıklama zorunludur`);
        }
        // Status default olarak ayarla eğer yoksa
        if (!task.status) {
          task.status = "Devam Ediyor";
        }
      });
    });

    if (validationErrors.length > 0) {
      toastStore.error(validationErrors[0]);
      if (validationErrors.length > 1) {
        console.error("Validation errors:", validationErrors);
      }
      return;
    }

    dailyReports.forEach((dayReport) => {
      // İçerik kontrolü - untrackedWork zorunlu değil
      const hasContent =
        dayReport.isOnLeave ||
        dayReport.tasks.some((t) => t.taskName && t.taskName.trim()) ||
        (Array.isArray(dayReport.blockers)
          ? dayReport.blockers.length > 0
          : (typeof dayReport.blockers === 'string' && dayReport.blockers.trim())) ||
        (Array.isArray(dayReport.meetings)
          ? dayReport.meetings.length > 0
          : (typeof dayReport.meetings === 'string' && dayReport.meetings.trim())) ||
        (dayReport.untrackedWork && dayReport.untrackedWork.trim());

      if (hasContent) {
        const dateParts = dayReport.date.split(".");
        const dateKey = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        dailyReportsStore.update((reports) => {
          const newReports = new Map(reports);
          newReports.set(dateKey, dayReport);
          return newReports;
        });
      }
    });

    const formatDateForDisplay = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-");
      return `${day}.${month}.${year}`;
    };

    const formattedStartDate = formatDateForDisplay(startDate);
    const formattedEndDate = formatDateForDisplay(endDate);

    // Sadece içerik olan günleri filtrele ve task'ları temizle
    const filledReports = dailyReports
      .filter(
        (day) =>
          day.isOnLeave ||
          day.tasks.some((t) => t.taskName && t.taskName.trim()) ||
          (Array.isArray(day.blockers)
            ? day.blockers.length > 0
            : (typeof day.blockers === 'string' && day.blockers.trim())) ||
          (Array.isArray(day.meetings)
            ? day.meetings.length > 0
            : (typeof day.meetings === 'string' && day.meetings.trim())) ||
          (day.untrackedWork && day.untrackedWork.trim())
      )
      .map((day) => {
        // İzinli günlerde task'ları temizle
        if (day.isOnLeave) {
          return {
            ...day,
            tasks: [],
            blockers: [],
            meetings: [],
            untrackedWork: "",
          };
        }

        // Sadece geçerli task'ları al (taskName, taskNumber, estimatedHours, description dolu olanlar)
        const validTasks = day.tasks.filter(
          (t) =>
            t.taskName &&
            t.taskName.trim() &&
            t.taskNumber &&
            t.taskNumber.trim() &&
            t.estimatedHours !== undefined &&
            t.estimatedHours !== null &&
            t.estimatedHours > 0 &&
            t.description &&
            t.description.trim()
        );

        // Status default olarak ayarla ve backend formatına hazırla
        const preparedTasks = validTasks.map((task) => ({
          ...task,
          status: task.status || "Devam Ediyor",
        }));

        return {
          ...day,
          tasks: preparedTasks,
        };
      });

    const successMessage = isEditMode 
      ? "Haftalık rapor başarıyla güncellendi!" 
      : "Haftalık rapor başarıyla oluşturuldu ve Son Gönderilen Raporlar listesine eklendi!";

    // Edit modundaysa ID tipini kontrol et ve doğru update fonksiyonunu çağır
    let reportPromise: Promise<any>;
    if (isEditMode && reportToEdit) {
      // Check if original reportId was a daily report ID (starts with "daily-")
      const originalReportId = (reportToEdit as any).originalId || reportToEdit.id;
      const isDailyReportId = originalReportId.startsWith('daily-');
      
      // Also check if it's a single day report
      const isSingleDayReport = reportToEdit.dailyReports.length === 1 && 
                                reportToEdit.startDate === reportToEdit.endDate;
      
      if (isDailyReportId || isSingleDayReport) {
        // Daily report update - use the daily report ID from dailyReports array
        const dailyReport = filledReports[0];
        const dailyReportId = reportToEdit.dailyReports[0]?.id || originalReportId;
        
        // If dailyReportId doesn't start with "daily-", it might be a weekly report ID format
        // In that case, use the original ID
        const finalDailyReportId = dailyReportId.startsWith('daily-') 
          ? dailyReportId 
          : originalReportId;
        
        reportPromise = updateDailyReport(
          finalDailyReportId,
          formattedStartDate,
          dailyReport
        ).then(() => ({
          id: reportToEdit.id,
          title: reportToEdit.title,
          date: reportToEdit.createdAt,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          tasks: []
        }));
      } else {
        // Weekly report update
        reportPromise = updateWeeklyReport(reportToEdit.id, formattedStartDate, formattedEndDate, filledReports);
      }
    } else {
      // Create new report
      reportPromise = createWeeklyReport(formattedStartDate, formattedEndDate, filledReports);
    }

    reportPromise
      .then((newReport) => {
        toastStore.success(successMessage, 4000);

        if (onReportCreated) {
          onReportCreated();
        }

        // Close preview modal first, then main modal
        showPreview = false;
        closeModal();
      })
      .catch((error) => {
        const validationErrors = getValidationErrors(error);
        if (validationErrors.length > 0) {
          // Validasyon hatalarını göster
          validationErrors.forEach(errMsg => {
            toastStore.error(errMsg);
          });
        } else {
          // Genel hata mesajını göster
          const errorMsg = getErrorMessage(error);
          toastStore.error(errorMsg);
        }
        // Don't close modal on error - let user fix the issue
      });
  }

  $: if (startDate && endDate && !isEditMode) {
    generateWeeklyReports();
  }

  $: if (startDate) {
    const start = new Date(startDate);
    const maxEnd = new Date(start);
    maxEnd.setDate(maxEnd.getDate() + 6);
    maxEndDate = maxEnd.toISOString().split("T")[0];

    if (endDate) {
      const end = new Date(endDate);
      if (end > maxEnd) {
        endDate = "";
      }
    }
  }

  // Bir günün dolu sayılması için: isOnLeave=true VEYA en az bir task var VEYA blocker var VEYA meeting var VEYA untrackedWork var
  // untrackedWork boş string olsa bile, diğer alanlar doluysa gün dolu sayılır
  $: filledDaysCount = dailyReports.filter(
    (day) =>
      day.isOnLeave ||
      day.tasks.some((t) => t.taskName && t.taskName.trim()) ||
      (Array.isArray(day.blockers) ? day.blockers.length > 0 : (typeof day.blockers === 'string' && day.blockers.trim())) ||
      (Array.isArray(day.meetings) ? day.meetings.length > 0 : (typeof day.meetings === 'string' && day.meetings.trim())) ||
      (day.untrackedWork && day.untrackedWork.trim())
  ).length;
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-default"
    on:click={closeModal}
    on:keydown={(e) => e.key === "Escape" && closeModal()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between"
      >
        <div>
          <h2
            class="text-2xl font-bold text-gray-900 dark:text-white"
            id="modal-title"
          >
            {isEditMode ? "📝 Haftalık Rapor Düzenle" : "Yeni Haftalık Rapor Oluştur"}
          </h2>
          {#if dailyReports.length > 0}
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filledDaysCount} / {dailyReports.length} gün dolduruldu
            </p>
          {/if}
        </div>
        <button
          on:click={closeModal}
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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

      <div class="overflow-y-auto max-h-[70vh]">
        <div class="p-6 space-y-6">
          <!-- Date Range Selection -->
          <div
            class="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800"
          >
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white mb-3"
            >
              📅 Rapor Dönemi {isEditMode ? "(Değiştirilemez)" : "Seçin"}
            </h3>
            {#if !isEditMode}
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
                <span class="font-medium">ℹ️ Bilgi:</span> Rapor dönemi en fazla 7
                gün olabilir.
              </p>
            {/if}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="start-date-input"
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Başlangıç Tarihi <span class="text-red-500">*</span>
                </label>
                <Input 
                  type="date" 
                  value={startDate} 
                  min={isEditMode ? undefined : mondayStr}
                  disabled={isEditMode} 
                />
              </div>
              <div>
                <label
                  for="end-date-input"
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Bitiş Tarihi <span class="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  bind:value={endDate}
                  min={startDate}
                  max={maxEndDate}
                  disabled={isEditMode || !startDate}
                />
              </div>
            </div>

            {#if dailyReports.length > 0}
              <div
                class="mt-3 text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>
                  {dailyReports.length} günlük rapor kartı hazırlandı
                </span>
              </div>
            {/if}
          </div>
          {#if isLoadingPreviousReports}
            <div class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Önceki raporlar yükleniyor...
              </p>
            </div>
          {:else if dailyReports.length > 0}
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Günlük Raporlar
                </h3>
                <span
                  class="text-sm px-3 py-1 rounded-full {filledDaysCount ===
                  dailyReports.length
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}"
                >
                  {filledDaysCount} / {dailyReports.length}
                </span>
              </div>

              {#each dailyReports as dayReport, index}
                <DailyReportCard
                  day={dayReport.day}
                  date={dayReport.date}
                  bind:tasks={dayReport.tasks}
                  bind:blockers={dayReport.blockers}
                  bind:meetings={dayReport.meetings}
                  bind:untrackedWork={dayReport.untrackedWork}
                  bind:isOnLeave={dayReport.isOnLeave}
                  isExpanded={index === 0}
                  on:change={() => {
                    dailyReports = [...dailyReports];
                  }}
                />
              {/each}
            </div>
          {:else}
            <div class="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                class="w-16 h-16 mx-auto mb-4 opacity-50"
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
              <p>Başlangıç ve bitiş tarihini seçerek başlayın</p>
            </div>
          {/if}
        </div>
      </div>

      <div
        class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700"
      >
        <Button text="İptal" variant="secondary" onClick={closeModal} />
        <Button
          text="📋 Önizleme ve Gönder"
          variant="primary"
          onClick={handlePreview}
          disabled={!startDate || !endDate || filledDaysCount === 0}
        />
      </div>
    </div>
  </div>
{/if}

<WeeklyReportPreview
  bind:isOpen={showPreview}
  {startDate}
  {endDate}
  {dailyReports}
  onConfirm={handleConfirmReport}
  onClose={() => (showPreview = false)}
/>
