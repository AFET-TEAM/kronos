<script lang="ts">
  import { initialDate } from '../../../../store/store.js';
  import LeftArrowIcon from '../../../../assets/icons/left-arrow.svg';
  import RightArrowIcon from '../../../../assets/icons/right-arrow.svg';

  let calenderMonth: string;

  // Store'dan mevcut tarihi alıp ay ismini güncelliyoruz
  $: {
    initialDate.subscribe((date: Date) => {
      calenderMonth = getMonthName(date);
    });
  }

  function getMonthName(date: Date): string {
    return date.toLocaleDateString('tr-TR', { month: 'long' });
  }

  const goToPreviousMonth = () => {
    initialDate.update((date: Date) => {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    initialDate.update((date: Date) => {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() + 1);
      return newDate;
    });
  };
</script>

<div class="flex justify-center items-center gap-40 py-5">
  <img src={LeftArrowIcon} alt="Previous Month" on:click={goToPreviousMonth} class="cursor-pointer" />
  <h1 class="text-6xl text-center w-80 text-white">{calenderMonth}</h1>
  <img src={RightArrowIcon} alt="Next Month" on:click={goToNextMonth} class="cursor-pointer" />
</div>


