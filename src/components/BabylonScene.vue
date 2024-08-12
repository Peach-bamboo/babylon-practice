<template>
  <div>
    <canvas ref="gameCanvas" width="800" height="600"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
// import { GameEngine } from '../engine/noUse/GameEngine';
import { Init } from '../engine/Init';

export default defineComponent({
  name: 'GameComponent',
  setup() {
    const gameCanvas = ref<HTMLCanvasElement | null>(null);

    onMounted(() => {
      if (gameCanvas.value) {
        // new GameEngine(gameCanvas.value);
        new Init(gameCanvas.value);
      }
    });

    return {
      gameCanvas,
    };
  },
});
</script>

<style scoped>
canvas {
  border: 1px solid black;
}
</style>
