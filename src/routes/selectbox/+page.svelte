<script lang="ts">
  import GeneralSelectbox from '../../components/GeneralSelectbox/GeneralSelectbox.svelte';
  const leftIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4bc.svg'; // briefcase
  const rightIcon = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/25be.svg'; // down arrow
  let selected = '';
  const options = [
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' }
  ];
</script>

<GeneralSelectbox
  label="Task Type"
  leftIcon={leftIcon}
  options={options}
  bind:selected
  placeholder="Select..."
/> 