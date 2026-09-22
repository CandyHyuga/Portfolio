<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { locale } from "../../../i18n/store";

const props = defineProps<{
  projectId: string;
}>();

export interface EnvironmentImage {
  id: string;
  name: string;
  url: string; // Blob URL, Data URL, or public path
  isCustom?: boolean;
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const customImages = ref<EnvironmentImage[]>([]);
const activeLightboxIndex = ref<number | null>(null);

// Check if running on local development/preview vs live production (GitHub Pages)
const isLocal = computed(() => {
  if (typeof window === "undefined") return false;
  return (
    import.meta.env.DEV ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
});

// Built-in default images for projects (fallback if available)
const defaultProjectImages: Record<string, string[]> = {
  "night-shippers": [],
  "gambling-gnomes": [
    "/images/projects/gambling-gnomes/3d-environment/gambling-gnomes-1.png",
    "/images/projects/gambling-gnomes/3d-environment/gambling-gnomes-2.png",
    "/images/projects/gambling-gnomes/3d-environment/gambling-gnomes-3.png",
  ],
};

// IndexedDB Helper for persistent 3D environment images
const DB_NAME = "portfolio_3d_environment_images_db";
const DB_VERSION = 1;
const STORE_NAME = "project_gallery";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "projectId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const saveImagesToDB = async (pid: string, images: EnvironmentImage[]) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    // Convert to serializable format
    const serializable = images.map((img) => ({
      id: img.id,
      name: img.name,
      url: img.url,
      isCustom: img.isCustom ?? true,
    }));
    store.put({ projectId: pid, images: serializable, updatedAt: Date.now() });
  } catch (err) {
    console.warn("Failed to save 3D environment images to IndexedDB:", err);
  }
};

const getImagesFromDB = async (pid: string): Promise<EnvironmentImage[] | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(pid);
      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result.images)) {
          resolve(req.result.images);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// Load images for current project
const loadProjectImages = async () => {
  const saved = await getImagesFromDB(props.projectId);
  if (saved !== null) {
    // Purge unwanted night-shippers default story screenshots if saved previously
    const cleaned = saved.filter(
      (img) => !img.url.includes("/night-shippers/3d-environment/night-shippers-")
    );
    customImages.value = cleaned;
    if (cleaned.length !== saved.length) {
      saveImagesToDB(props.projectId, cleaned);
    }
  } else {
    // Populate with default images if available
    const defaults = defaultProjectImages[props.projectId] || [];
    customImages.value = defaults.map((url, idx) => ({
      id: `${props.projectId}-def-${idx}`,
      name: url.split("/").pop() || `Render ${idx + 1}`,
      url,
      isCustom: true,
    }));
    saveImagesToDB(props.projectId, customImages.value);
  }
};

watch(() => props.projectId, () => {
  loadProjectImages();
}, { immediate: true });

onMounted(() => {
  loadProjectImages();
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

// All displayed images
const allImages = computed(() => customImages.value);

// File upload handler
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFiles(Array.from(target.files));
    target.value = ""; // Reset input so same file can be re-uploaded
  }
};

const onDragOver = () => {
  if (isLocal.value) isDragOver.value = true;
};

const handleDrop = (e: DragEvent) => {
  if (!isLocal.value) return;
  isDragOver.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    processFiles(Array.from(e.dataTransfer.files));
  }
};

const processFiles = (files: File[]) => {
  const imageFiles = files.filter((f) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp";
  });

  if (imageFiles.length === 0) {
    alert(
      locale.value === "vi"
        ? "Vui lòng chọn file hình ảnh (.png, .jpg, .jpeg hoặc .webp) để trưng bày."
        : "Please select image files (.png, .jpg, .jpeg, or .webp) to showcase."
    );
    return;
  }

  imageFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newImg: EnvironmentImage = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          url: dataUrl,
          isCustom: true,
        };
        customImages.value.push(newImg);
        saveImagesToDB(props.projectId, customImages.value);
      }
    };
    reader.readAsDataURL(file);
  });
};

const deleteImage = (id: string, name: string, e?: Event) => {
  if (e) e.stopPropagation();
  const confirmed = window.confirm(
    locale.value === "vi"
      ? `Bạn có chắc chắn muốn loại bỏ ảnh "${name}" không?`
      : `Are you sure you want to remove "${name}"?`
  );
  if (!confirmed) return;

  customImages.value = customImages.value.filter((img) => img.id !== id);
  saveImagesToDB(props.projectId, customImages.value);

  // If deleting currently active image in lightbox
  if (activeLightboxIndex.value !== null) {
    if (customImages.value.length === 0) {
      closeLightbox();
    } else if (activeLightboxIndex.value >= customImages.value.length) {
      activeLightboxIndex.value = customImages.value.length - 1;
    }
  }
};

// Lightbox Modal
const activeLightboxImage = computed(() => {
  if (activeLightboxIndex.value === null) return null;
  return allImages.value[activeLightboxIndex.value] || null;
});

const openLightbox = (index: number) => {
  activeLightboxIndex.value = index;
};

const closeLightbox = () => {
  activeLightboxIndex.value = null;
};

const nextLightbox = () => {
  if (activeLightboxIndex.value === null) return;
  activeLightboxIndex.value = (activeLightboxIndex.value + 1) % allImages.value.length;
};

const prevLightbox = () => {
  if (activeLightboxIndex.value === null) return;
  activeLightboxIndex.value =
    (activeLightboxIndex.value - 1 + allImages.value.length) % allImages.value.length;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (activeLightboxIndex.value === null) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextLightbox();
  if (e.key === "ArrowLeft") prevLightbox();
};
</script>

<template>
  <div class="project-3d-environment">
    <!-- Header Section (Matching User Layout) -->
    <div class="env-header">
      <h3 class="env-title">3D Environment</h3>
      <div class="env-sub-bar">
        <div class="ingame-map-badge">
          <span>INGAME MAP</span>
        </div>
        <p class="env-subtitle">
          Environmental renders, lighting dioramas, and modular assets (PNG / JPG)
        </p>
      </div>

      <input
        v-if="isLocal"
        ref="fileInputRef"
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        multiple
        class="hidden-file-input"
        @change="handleFileInput"
      />
    </div>

    <!-- Drop Zone & Cards Grid (3-column rounded rectangular boxes matching drawing) -->
    <div
      class="env-grid"
      :class="{ 'is-dragging': isLocal && isDragOver }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <!-- Displayed Image Cards -->
      <div
        v-for="(img, idx) in allImages"
        :key="img.id"
        class="env-card"
        @click="openLightbox(idx)"
      >
        <div class="card-media-wrapper">
          <img :src="img.url" :alt="img.name" class="card-img" loading="lazy" />
          
          <!-- Hover Overlay with Actions -->
          <div class="card-overlay">
            <span class="zoom-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </span>
            <span class="card-label">{{ img.name }}</span>

            <!-- Delete Image button on all cards (only on local) -->
            <button
              v-if="isLocal"
              class="delete-btn"
              @click.stop="deleteImage(img.id, img.name, $event)"
              :title="locale === 'vi' ? 'Loại bỏ ảnh này' : 'Delete image'"
              :aria-label="locale === 'vi' ? 'Loại bỏ ảnh này' : 'Delete image'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Image Box (Rounded Rectangular Slot) - only on local -->
      <div v-if="isLocal" class="env-card add-card" @click="triggerFileInput">
        <div class="add-card-content">
          <div class="add-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <span class="add-text">
            {{ locale === "vi" ? "+ Add 3D Render" : "+ Add 3D Render" }}
          </span>
          <span class="add-subtext">
            {{ locale === "vi" ? "PNG / JPG (Permanent Save)" : "PNG / JPG (Permanent Save)" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Lightbox Full-screen Modal -->
    <Teleport to="body">
      <div
        v-if="activeLightboxImage !== null"
        class="lightbox-backdrop"
        @click="closeLightbox"
      >
        <div class="lightbox-container" @click.stop>
          <div class="lightbox-top-bar">
            <button
              v-if="isLocal"
              class="lightbox-delete-btn"
              @click.stop="deleteImage(activeLightboxImage.id, activeLightboxImage.name, $event)"
              :title="locale === 'vi' ? 'Loại bỏ ảnh này' : 'Remove this image'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>{{ locale === "vi" ? "Loại bỏ ảnh" : "Remove" }}</span>
            </button>

            <button class="lightbox-close" @click="closeLightbox" aria-label="Close">
              ✕
            </button>
          </div>

          <button
            v-if="allImages.length > 1"
            class="lightbox-nav prev"
            @click.stop="prevLightbox"
            aria-label="Previous"
          >
            ❮
          </button>

          <div class="lightbox-image-wrapper">
            <img
              :src="activeLightboxImage.url"
              :alt="activeLightboxImage.name"
              class="lightbox-img"
            />
            <div class="lightbox-caption">
              <span>{{ activeLightboxImage.name }}</span>
              <span class="lightbox-counter">{{ (activeLightboxIndex ?? 0) + 1 }} / {{ allImages.length }}</span>
            </div>
          </div>

          <button
            v-if="allImages.length > 1"
            class="lightbox-nav next"
            @click.stop="nextLightbox"
            aria-label="Next"
          >
            ❯
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.project-3d-environment {
  width: 100%;
  max-width: 1400px;
  margin: var(--space-xl) auto 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.env-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  margin-bottom: 6px;
}

.env-title {
  font-family: var(--font-primary, serif);
  font-size: clamp(50px, 5.5vw, 64px);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--color-text-400);
  margin: 0;
  text-align: center;
  width: 100%;
}

.env-sub-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 46px;

  @media (max-width: 860px) {
    flex-direction: column;
    gap: 12px;
    min-height: auto;
  }
}

.ingame-map-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-400, #ff7f11);
  color: #ffffff;
  padding: 8px 24px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 4px 16px rgba(255, 127, 17, 0.45);
  white-space: nowrap;
  user-select: none;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  @media (min-width: 861px) {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);

    &:hover {
      transform: translateY(calc(-50% - 1px));
      box-shadow: 0 6px 20px rgba(255, 127, 17, 0.6);
    }
  }

  @media (max-width: 860px) {
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(255, 127, 17, 0.6);
    }
  }
}

.env-subtitle {
  font-size: 14px;
  color: var(--color-text-300, #8e8a9f);
  margin: 0;
  line-height: 1.45;
  font-weight: 500;
  text-align: center;
}

.hidden-file-input {
  display: none;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-accent-400, #ff7f11);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 127, 17, 0.35);
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 127, 17, 0.5);
    background: #ff8c2a;
  }

  &:active {
    transform: translateY(0);
  }

  .icon-upload {
    width: 18px;
    height: 18px;
  }
}

// 3-Column Responsive Grid of Rounded Rectangles (Matching User's Drawing)
.env-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  transition: border-color 0.2s ease;

  @include mixins.mq("sm") {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mixins.mq("lg") {
    grid-template-columns: repeat(3, 1fr);
  }

  &.is-dragging {
    outline: 2px dashed var(--color-accent-400, #ff7f11);
    outline-offset: 8px;
    border-radius: 20px;
  }
}

// Rounded Rectangular Box Card
.env-card {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 127, 17, 0.5);

    .card-img {
      transform: scale(1.05);
    }

    .card-overlay {
      opacity: 1;
    }
  }

  .card-media-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.75) 100%);
    opacity: 0;
    transition: opacity 0.25s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
  }

  .zoom-indicator {
    align-self: flex-start;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .card-label {
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .delete-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(220, 38, 38, 0.85);
    border: none;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;

    &:hover {
      background: #ef4444;
      transform: scale(1.1);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

// Add New Card (Rounded rectangle with dashed border)
.add-card {
  border: 2px dashed rgba(255, 127, 17, 0.45);
  background: rgba(255, 127, 17, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: var(--color-accent-400, #ff7f11);
    background: rgba(255, 127, 17, 0.08);

    .add-icon {
      transform: scale(1.08);
      background: var(--color-accent-400, #ff7f11);
      color: #ffffff;
    }
  }

  .add-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px;
    text-align: center;
  }

  .add-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 127, 17, 0.12);
    color: var(--color-accent-400, #ff7f11);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);

    svg {
      width: 22px;
      height: 22px;
    }
  }

  .add-text {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-accent-400, #ff7f11);
  }

  .add-subtext {
    font-size: 12px;
    color: var(--color-text-300, #8e8a9f);
  }
}

// Lightbox
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(12px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lightbox-container {
  position: relative;
  max-width: 92vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.lightbox-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: #e5e5e5;
  font-size: 14px;
  font-weight: 600;
  padding: 0 8px;
}

.lightbox-counter {
  color: var(--color-accent-400, #ff7f11);
  font-weight: 700;
}

.lightbox-top-bar {
  position: absolute;
  top: -46px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.lightbox-delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(220, 38, 38, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: #ef4444;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 15px;
    height: 15px;
  }
}

.lightbox-close {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.08);
  }
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 22px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-accent-400, #ff7f11);
    transform: translateY(-50%) scale(1.1);
  }

  &.prev {
    left: -60px;
  }

  &.next {
    right: -60px;
  }
}
</style>
