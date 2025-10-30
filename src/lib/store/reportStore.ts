import { writable } from "svelte/store";
import type { DailyReport } from "../services/reportService.js";

export const dailyReportsStore = writable<Map<string, DailyReport>>(new Map());

export function saveDailyReport(date: string, report: DailyReport) {
  dailyReportsStore.update((reports) => {
    const newReports = new Map(reports);
    newReports.set(date, report);
    return newReports;
  });
}

export function getDailyReport(date: string): DailyReport | undefined {
  let report: DailyReport | undefined;
  dailyReportsStore.subscribe((reports) => {
    report = reports.get(date);
  })();
  return report;
}

export function clearDailyReports() {
  dailyReportsStore.set(new Map());
}

export function getReportsInRange(
  startDate: string,
  endDate: string
): DailyReport[] {
  const reports: DailyReport[] = [];
  let allReports: Map<string, DailyReport>;

  dailyReportsStore.subscribe((r) => {
    allReports = r;
  })();

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dateKey = date.toISOString().split("T")[0];
    const report = allReports!.get(dateKey);
    if (report) {
      reports.push(report);
    }
  }

  return reports;
}
