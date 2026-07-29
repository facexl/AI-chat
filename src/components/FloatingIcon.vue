<template>
  <div
    ref="iconEl"
    class="floating-icon"
    @mouseover="onHover"
    @mouseleave="hovering = false"
    @click="$emit('click')"
  >
    <img
      class="icon-img"
      :class="{ rotating: hovering }"
      :src="iconUrl"
      alt="AI-chat"
    />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  click: []
}>()

const hovering = ref(false)

let hoverTimer: ReturnType<typeof setTimeout>

function onHover() {
  hovering.value = true
  clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    if (hovering.value) {
      emit('click')
    }
  }, 1000)
}

const iconUrl = ref('/icon.png')
if (typeof chrome !== 'undefined' && chrome.runtime) {
  iconUrl.value = chrome.runtime.getURL('/icon.png')
}
</script>

<style lang="less">
.floating-icon {
  position: absolute;
  z-index: 2147483647;
  // background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  .icon-img {
    width: 30px;
    height: 30px;
    display: block;
  }

  .rotating {
    animation: floatSpin 1s infinite linear;
  }
}

@keyframes floatSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
