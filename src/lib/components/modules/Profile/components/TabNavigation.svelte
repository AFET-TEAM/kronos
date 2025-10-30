<script lang="ts">
  export let activeTab: string = "profile";
</script>

<div class="flex flex-wrap border-b border-slate-700">
  <button
    class="flex-1 min-w-[120px] md:min-w-auto px-4 md:px-6 py-3 md:py-4 text-white font-semibold border-b-2 transition"
    class:border-indigo-600={activeTab === "profile"}
    class:border-slate-700={activeTab !== "profile"}
    class:bg-opacity-10={activeTab === "profile"}
    class:bg-indigo-600={activeTab === "profile"}
    on:click={() => (activeTab = "profile")}
  >
    Profil Bilgisi
  </button>
  <button
    class="flex-1 min-w-[120px] md:min-w-auto px-4 md:px-6 py-3 md:py-4 text-slate-400 font-semibold border-b-2 transition cursor-pointer"
    class:border-indigo-600={activeTab === "corporate"}
    class:border-slate-700={activeTab !== "corporate"}
    class:text-white={activeTab === "corporate"}
    class:bg-opacity-10={activeTab === "corporate"}
    class:bg-indigo-600={activeTab === "corporate"}
    on:click={() => (activeTab = "corporate")}
  >
    Kurumsal Bilgiler
  </button>
  <button
    class="flex-1 min-w-[120px] md:min-w-auto px-4 md:px-6 py-3 md:py-4 text-slate-400 font-semibold border-b-2 transition cursor-pointer"
    class:border-indigo-600={activeTab === "settings"}
    class:border-slate-700={activeTab !== "settings"}
    class:text-white={activeTab === "settings"}
    class:bg-opacity-10={activeTab === "settings"}
    class:bg-indigo-600={activeTab === "settings"}
    on:click={() => (activeTab = "settings")}
  >
    Ayarlar
  </button>
</div>
