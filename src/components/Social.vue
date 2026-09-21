<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import Facebook from "./icons/Facebook.vue";
import Discord from "./icons/Discord.vue";
import Github from "./icons/Github.vue";
import Linkedin from "./icons/Linkedin.vue";
import Instagram from "./icons/Instagram.vue";
import Mail from "./icons/Mail.vue";
import X from "./icons/X.vue";
import Zalo from "./icons/Zalo.vue";
import Link from "./Link.vue";
import { t } from "../i18n/utils/translate";
import { locale } from "../i18n/store";
import ButtonRound from "./ButtonRound.vue";
import Button from "./Button.vue";

import facebookQrImg from "../assets/images/facebook-qr.png";
import instagramQrImg from "../assets/images/instagram-qr.png";
import discordQrImg from "../assets/images/discord-qr.png";
import zaloQrImg from "../assets/images/zalo-qr.jpg";

import { social } from "../content/social";

const props = defineProps<{
  variant?: "theme" | "background";
}>();

type ModalType = "mail" | "instagram" | "discord" | "zalo" | "facebook";
const activeModal = ref<ModalType | null>(null);
const copiedItem = ref<string | null>(null);

const openModal = (type: ModalType) => {
  activeModal.value = type;
};

const closeModal = () => {
  activeModal.value = null;
};

const copyText = async (text: string, identifier: string) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedItem.value = identifier;
    setTimeout(() => {
      if (copiedItem.value === identifier) {
        copiedItem.value = null;
      }
    }, 2000);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && activeModal.value !== null) {
    closeModal();
  }
};

watch(activeModal, (isOpen) => {
  if (isOpen) {
    window.addEventListener("keydown", handleKeyDown);
  } else {
    window.removeEventListener("keydown", handleKeyDown);
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// Map icon names to components
const icons = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  x: X,
  zalo: Zalo,
  instagram: Instagram,
  facebook: Facebook,
  discord: Discord,
} as const;

const getAriaLabel = (name: string) => `${t("go-to")} ${name.charAt(0).toUpperCase() + name.slice(1)}`;

const isModalItem = (name: string): name is ModalType => {
  return ["mail", "instagram", "discord", "zalo", "facebook"].includes(name);
};

const modalInfo = computed(() => {
  if (!activeModal.value) return null;
  switch (activeModal.value) {
    case "mail":
      return {
        type: "mail",
        name: "Gmail",
        icon: Mail,
        title: "Gmail",
        subtitle: locale.value === "vi" ? "Liên hệ trực tiếp qua hộp thư Gmail" : "Contact directly via Gmail",
        account: "candyhyuga1509@gmail.com",
        accountLabel: locale.value === "vi" ? "Địa chỉ Email:" : "Email Address:",
        image: null,
        fullUrl: "https://mail.google.com/mail/?view=cm&fs=1&to=candyhyuga1509@gmail.com",
        actionText: locale.value === "vi" ? "Gửi thư qua Gmail ✉️" : "Send Email Now ✉️",
        directLink: "https://mail.google.com/mail/?view=cm&fs=1&to=candyhyuga1509@gmail.com",
        phone: null,
      };
    case "instagram":
      return {
        type: "qr",
        name: "Instagram",
        icon: Instagram,
        title: locale.value === "vi" ? "Mã QR Instagram" : "Instagram QR Code",
        subtitle: locale.value === "vi" ? "Quét mã để kết nối trên Instagram" : "Scan to connect on Instagram",
        account: "Candy Truong",
        accountLabel: locale.value === "vi" ? "Tài khoản:" : "Account:",
        image: instagramQrImg,
        fullUrl: "/instagram-qr.png",
        actionText: locale.value === "vi" ? "Xem ảnh gốc ↗" : "View Full Image ↗",
        directLink: null,
        phone: null,
      };
    case "discord":
      return {
        type: "qr",
        name: "Discord",
        icon: Discord,
        title: locale.value === "vi" ? "Mã QR Discord" : "Discord QR Code",
        subtitle: locale.value === "vi" ? "Quét mã để kết bạn trên Discord" : "Scan to connect on Discord",
        account: "candy_truong",
        accountLabel: locale.value === "vi" ? "Tài khoản:" : "Account:",
        image: discordQrImg,
        fullUrl: "/discord-qr.png",
        actionText: locale.value === "vi" ? "Xem ảnh gốc ↗" : "View Full Image ↗",
        directLink: null,
        phone: null,
      };
    case "zalo":
      return {
        type: "qr",
        name: "Zalo",
        icon: Zalo,
        title: locale.value === "vi" ? "Mã QR Zalo" : "Zalo QR Code",
        subtitle: locale.value === "vi" ? "Quét mã để kết bạn trên Zalo" : "Scan to connect on Zalo",
        account: "Trương Ngọc Thiên Hương",
        accountLabel: locale.value === "vi" ? "Tên hiển thị:" : "Display Name:",
        image: zaloQrImg,
        fullUrl: "/zalo-qr.jpg",
        actionText: locale.value === "vi" ? "Mở Zalo Chat 💬" : "Open Zalo Chat 💬",
        directLink: "https://zalo.me/0902821526",
        phone: "0902 821 526",
      };
    case "facebook":
      return {
        type: "qr",
        name: "Facebook",
        icon: Facebook,
        title: locale.value === "vi" ? "Mã QR Facebook" : "Facebook QR Code",
        subtitle: locale.value === "vi" ? "Quét mã để kết nối trên Facebook" : "Scan to connect on Facebook",
        account: "Candy Truong",
        accountLabel: locale.value === "vi" ? "Tài khoản:" : "Account:",
        image: facebookQrImg,
        fullUrl: "/facebook-qr.png",
        actionText: locale.value === "vi" ? "Xem ảnh gốc ↗" : "View Full Image ↗",
        directLink: null,
        phone: null,
      };
  }
});
</script>

<template>
  <div class="social">
    <template v-for="item in social" :key="item.name">
      <!-- Interactive modal link items (Mail, Instagram, Discord, Zalo, Facebook) -->
      <a
        v-if="isModalItem(item.name)"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        @click.prevent="openModal(item.name)"
        :aria-label="getAriaLabel(item.name)"
        class="social-link social-link-button"
        data-cursor="circle-white"
        data-sound="click"
      >
        <ButtonRound
          renderAs="div"
          :variant="props.variant ?? 'theme'"
          class="children-unclickable"
          data-hoversound="hover"
        >
          <component :is="icons[item.name]" :aria-label="getAriaLabel(item.name)" external />
        </ButtonRound>
      </a>

      <!-- Fallback regular links (if any) -->
      <Link
        v-else
        external
        :href="item.url"
        :aria-label="getAriaLabel(item.name)"
        class="social-link"
        data-cursor="circle-white"
      >
        <ButtonRound
          renderAs="div"
          :variant="props.variant ?? 'theme'"
          class="children-unclickable"
          data-hoversound="hover"
        >
          <component :is="icons[item.name]" :aria-label="getAriaLabel(item.name)" external />
        </ButtonRound>
      </Link>
    </template>

    <!-- Unified Contact / QR Modal Teleport -->
    <Teleport to="body">
      <Transition name="social-modal-fade">
        <div v-if="activeModal && modalInfo" class="social-modal-backdrop" @click.self="closeModal">
          <div class="social-modal-dialog">
            <button class="social-modal-close" @click="closeModal" aria-label="Close modal">
              ✕
            </button>
            <div class="social-modal-card">
              <!-- Modal Header -->
              <div class="social-modal-header">
                <div class="social-modal-icon-badge">
                  <component :is="modalInfo.icon" class="social-modal-header-icon" />
                </div>
                <h3 class="social-modal-title">{{ modalInfo.title }}</h3>
                <p class="social-modal-subtitle">{{ modalInfo.subtitle }}</p>
              </div>

              <!-- Content for QR types (Instagram, Discord, Zalo, Facebook) -->
              <template v-if="modalInfo.type === 'qr' && modalInfo.image">
                <a
                  :href="modalInfo.fullUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="social-modal-image-wrap"
                  :title="locale === 'vi' ? 'Nhấn để xem ảnh gốc trong tab mới' : 'Click to view full image in new tab'"
                >
                  <img :src="modalInfo.image" :alt="modalInfo.title" class="social-modal-image" />
                </a>

                <!-- Account username display below QR code -->
                <div class="social-modal-account-pill">
                  <span class="account-label">{{ modalInfo.accountLabel }}</span>
                  <strong class="account-value">{{ modalInfo.account }}</strong>
                  <button
                    type="button"
                    class="copy-badge-btn"
                    :class="{ 'copy-badge-btn-copied': copiedItem === 'account' }"
                    @click="copyText(modalInfo.account, 'account')"
                    :title="locale === 'vi' ? 'Sao chép tên tài khoản' : 'Copy account username'"
                  >
                    {{ copiedItem === "account" ? (locale === "vi" ? "Đã chép! ✓" : "Copied! ✓") : (locale === "vi" ? "Copy" : "Copy") }}
                  </button>
                </div>
              </template>

              <!-- Content for Mail type (Gmail) -->
              <template v-else-if="modalInfo.type === 'mail'">
                <div class="social-modal-mail-box">
                  <div class="mail-display-row">
                    <span class="mail-address">{{ modalInfo.account }}</span>
                    <button
                      type="button"
                      class="copy-badge-btn"
                      :class="{ 'copy-badge-btn-copied': copiedItem === 'email' }"
                      @click="copyText(modalInfo.account, 'email')"
                      :title="locale === 'vi' ? 'Sao chép địa chỉ Gmail' : 'Copy Gmail address'"
                    >
                      {{ copiedItem === "email" ? (locale === "vi" ? "Đã chép! ✓" : "Copied! ✓") : (locale === "vi" ? "Copy" : "Copy") }}
                    </button>
                  </div>
                </div>
              </template>

              <!-- Extra Info & Actions -->
              <div class="social-modal-info">
                <!-- Phone row for Zalo -->
                <div v-if="modalInfo.phone" class="social-modal-account-pill">
                  <span class="account-label">SĐT / Zalo:</span>
                  <strong class="account-value">{{ modalInfo.phone }}</strong>
                  <button
                    type="button"
                    class="copy-badge-btn"
                    :class="{ 'copy-badge-btn-copied': copiedItem === 'phone' }"
                    @click="copyText(modalInfo.phone, 'phone')"
                    :title="locale === 'vi' ? 'Sao chép số điện thoại' : 'Copy phone number'"
                  >
                    {{ copiedItem === "phone" ? (locale === "vi" ? "Đã chép! ✓" : "Copied! ✓") : (locale === "vi" ? "Copy" : "Copy") }}
                  </button>
                </div>

                <div class="social-modal-actions">
                  <a
                    :href="modalInfo.directLink || modalInfo.fullUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-direct-link"
                  >
                    <Button renderAs="div" variant="accent">
                      {{ modalInfo.actionText }}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.social {
  display: flex;
  gap: var(--space-md);

  &-link-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    text-decoration: none;
  }
}

/* Common oval copy button: dark pill with light text, turns green when copied */
.copy-badge-btn {
  border: none !important;
  outline: none !important;
  font-family: inherit !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  background: var(--color-text-400, #2d2a24) !important;
  color: var(--color-background-400, #ccccff) !important;
  padding: 3px 12px !important;
  border-radius: 100px !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1.4 !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) !important;

  &:hover {
    transform: scale(1.05) !important;
    opacity: 0.9 !important;
  }

  &-copied {
    background: #10b981 !important;
    color: #ffffff !important;
  }
}

.social-modal {
  &-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(10, 12, 16, 0.72);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  &-dialog {
    position: relative;
    max-width: 380px;
    width: 100%;
    background: var(--color-background-400, #f7f3ed);
    border: 1.5px solid color-mix(in srgb, var(--color-text-400) 22%, transparent);
    border-radius: var(--radius-xl, 24px);
    padding: 24px 20px 20px 20px;
    box-shadow:
      0 24px 48px rgba(0, 0, 0, 0.28),
      0 8px 16px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: social-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--color-text-400) 20%, transparent);
    background: color-mix(in srgb, var(--color-background-400) 80%, transparent);
    color: var(--color-text-400);
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
      transform: scale(1.1);
      background: var(--color-text-400);
      color: var(--color-background-400);
    }
  }

  &-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    width: 100%;
  }

  &-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
  }

  &-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--color-text-400) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-text-400) 16%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    color: var(--color-text-400);

    .social-modal-header-icon {
      width: 22px;
      height: 22px;
      fill: var(--color-text-400);
    }
  }

  &-title {
    font-size: 17px;
    font-weight: 800;
    color: var(--color-text-400);
    margin: 0;
    letter-spacing: -0.01em;
  }

  &-subtitle {
    font-size: 12.5px;
    color: var(--color-text-400);
    opacity: 0.75;
    margin: 0;
  }

  &-image-wrap {
    width: 100%;
    max-width: 270px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
    border: 1px solid color-mix(in srgb, var(--color-text-400) 12%, transparent);
    background: #ffffff;
    display: block;
    cursor: zoom-in;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
    }
  }

  &-image {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Account name pill directly below QR code */
  &-account-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 320px;
    padding: 7px 12px 7px 14px;
    background: color-mix(in srgb, var(--color-text-400) 7%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-text-400) 16%, transparent);
    border-radius: 100px;
    gap: 8px;
    font-size: 13px;

    .account-label {
      font-size: 11.5px;
      opacity: 0.7;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .account-value {
      font-weight: 800;
      color: var(--color-text-400);
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }
  }

  /* Gmail display card */
  &-mail-box {
    width: 100%;
    max-width: 320px;
    padding: 12px 14px;
    background: color-mix(in srgb, var(--color-text-400) 6%, transparent);
    border: 1.5px dashed color-mix(in srgb, var(--color-text-400) 24%, transparent);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin: 4px 0;

    .mail-display-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
    }

    .mail-address {
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text-400);
      letter-spacing: 0.01em;
      word-break: break-all;
    }
  }

  &-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  &-actions {
    width: 100%;
    display: flex;
    justify-content: center;

    .social-direct-link {
      text-decoration: none;
      width: 100%;
      max-width: 240px;

      :deep(.button) {
        width: 100%;
      }
    }
  }
}

/* Animations */
.social-modal-fade-enter-active,
.social-modal-fade-leave-active {
  transition: opacity 0.25s ease;

  .social-modal-dialog {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.social-modal-fade-enter-from,
.social-modal-fade-leave-to {
  opacity: 0;

  .social-modal-dialog {
    transform: scale(0.92) translateY(8px);
  }
}

@keyframes social-pop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
