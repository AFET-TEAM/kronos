<script lang="ts">

  import { initialDate } from '../../../../store/store.js';

  let currentDatee: Date = new Date();
  let days: number[] = [];
  let startDay: number = 0;
  let startOfWeek: Date;
  let endOfWeek: Date;

  $: {
    initialDate.subscribe(date => {
      generateCalendar(date);
      ({ startOfWeek, endOfWeek } = getWeekRange(date));
    });
  }

  function getWeekRange(date: Date) {
    const currentDay = date.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() + diffToMonday - 1); // Pazar günü
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5); // Haftanın Cuma günü

    return { startOfWeek, endOfWeek };
  }

  function generateCalendar(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    startDay = (firstDay === 0 ? 7 : firstDay) - 1;
    days = Array(startDay).fill(0); // Ayın başındaki boş günler

    days.push(...Array.from({ length: totalDays }, (_, i) => i + 1));

    // Eğer 35'ten fazla gün varsa, günlerin eksik olduğu hücreleri doldur
    if (days.length < 35) {
      days.push(...Array(35 - days.length).fill(0));
    } else if (days.length > 35) {
      // Eğer 35'ten fazla gün varsa, toplam hücre sayısını 42'ye çıkar (6 hafta)
      days.push(...Array(42 - days.length).fill(0));
    }
  }

 // Günün haftanın Pazartesi ve Cuma arasındaki aralıkta olup olmadığını kontrol eden fonksiyon
 function isDateInRange(day: number): any {
    const dayDate = new Date(currentDatee.getFullYear(), currentDatee.getMonth(), day);
    return dayDate >= startOfWeek && dayDate <= endOfWeek;
}
</script>

<div class="grid grid-cols-7 gap-2 py-2">
  {#each days as day, index}
    <div
      class={`flex items-center justify-center border border-white text-white text-3xl h-24 ${
        day !== 0 && isDateInRange(day) ? 'cursor-pointer hover:opacity-60'  : 'cursor-default'
      }`}
    >
      {#if day !== 0}
        {day}
      {/if}
    </div>
  {/each}
</div>


