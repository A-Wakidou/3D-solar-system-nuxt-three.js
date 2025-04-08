<script setup>
</script>

<template>
    <div class="fixed inset-0 bg-black z-50">

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div class="relative w-32 h-32">
                <img src="/logo.png" alt="Logo" class="w-full h-full rounded-full z-10 p-3" />
                <!-- Anneau de chargement -->
                <div
                    class="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-white rounded-full animate-spin">
                </div>
            </div>
            <p class="text-white block mt-2">Chargement...</p>
        </div>
    </div>
</template>