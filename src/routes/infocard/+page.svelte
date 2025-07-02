<script lang="ts">
  import GeneralInfocard from '../../components/GeneralInfocard/GeneralInfocard.svelte';
  const leftIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c8.svg';
  const rightIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e4.svg';
</script>

<div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-900 dark:to-gray-800">
  <GeneralInfocard
    rightIcon={rightIcon}
    value={99}
    label="reports send"
  />
</div> 