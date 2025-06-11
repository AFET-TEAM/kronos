<script lang="ts">
  // Style
  import "../../app.scss";

  // Components
  import Days from './components/Days/days.svelte';
  import CalendarLayout from './components/CalendarLayout/calendarLayout.svelte';
  import CalendarHeader from "./components/CalendarHeader/calendarHeader.svelte";
</script>

<div id="calender-wrapper" class="bg-custom-blue h-screen w-full">
  <div  class="container mx-auto ">
   <CalendarHeader/>
   <Days/>
   <CalendarLayout/>
  </div>
</div>
