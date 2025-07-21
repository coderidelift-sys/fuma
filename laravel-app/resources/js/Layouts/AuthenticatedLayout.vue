<script setup>
import { ref, onMounted } from 'vue'
import { usePage, Link } from '@inertiajs/vue3'
const sidebarOpen = ref(true)
const darkMode = ref(false)
const user = usePage().props.auth?.user
const pageTitle = usePage().props.title || 'Dashboard'

function isActive(path) {
  return window.location.pathname.startsWith(path)
}
function toggleDarkMode() {
  darkMode.value = !darkMode.value
  localStorage.setItem('fuma-admin-dark', darkMode.value ? '1' : '0')
}
onMounted(() => {
  darkMode.value = localStorage.getItem('fuma-admin-dark') === '1'
})
</script>

<template>
  <div :class="['d-flex', darkMode ? 'bg-dark text-light' : 'bg-light']" style="min-height: 100vh;">
    <!-- Sidebar -->
    <nav :class="['sidebar', 'bg-white', 'border-end', 'shadow-sm', darkMode ? 'bg-dark text-light' : '']" :style="{width: sidebarOpen ? '220px' : '60px', transition: 'width 0.2s'}">
      <div class="d-flex flex-column align-items-center py-3 h-100">
        <button class="btn btn-link mb-4" @click="sidebarOpen = !sidebarOpen">
          <i :class="sidebarOpen ? 'fas fa-angle-double-left' : 'fas fa-angle-double-right'"></i>
        </button>
        <div v-if="sidebarOpen" class="mb-4 fw-bold fs-5">FUMA Admin</div>
        <ul class="nav nav-pills flex-column w-100">
          <li class="nav-item mb-2">
            <Link :href="route('admin.dashboard')" class="nav-link" :class="isActive('/admin') && sidebarOpen ? 'active' : ''">
              <i class="fas fa-home me-2"></i> <span v-if="sidebarOpen">Dashboard</span>
            </Link>
          </li>
          <li class="nav-item mb-2">
            <Link :href="route('admin.tournaments.index')" class="nav-link" :class="isActive('/admin/tournaments') && sidebarOpen ? 'active' : ''">
              <i class="fas fa-trophy me-2"></i> <span v-if="sidebarOpen">Turnamen</span>
            </Link>
          </li>
          <li class="nav-item mb-2">
            <Link :href="route('admin.teams.index')" class="nav-link" :class="isActive('/admin/teams') && sidebarOpen ? 'active' : ''">
              <i class="fas fa-users me-2"></i> <span v-if="sidebarOpen">Tim</span>
            </Link>
          </li>
          <li class="nav-item mb-2">
            <Link :href="route('admin.players.index')" class="nav-link" :class="isActive('/admin/players') && sidebarOpen ? 'active' : ''">
              <i class="fas fa-user me-2"></i> <span v-if="sidebarOpen">Pemain</span>
            </Link>
          </li>
        </ul>
        <div class="mt-auto mb-2">
          <button class="btn btn-sm btn-outline-secondary" @click="toggleDarkMode">
            <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>
    </nav>
    <!-- Main Content -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100">
      <!-- Topbar -->
      <header class="navbar navbar-expand navbar-light bg-white border-bottom shadow-sm px-3" :class="darkMode ? 'bg-dark text-light border-secondary' : ''">
        <div class="container-fluid">
          <span class="navbar-brand fw-bold">{{ pageTitle }}</span>
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item me-2">
              <span class="nav-link">{{ user?.full_name }}</span>
            </li>
            <li class="nav-item">
              <a class="btn btn-sm btn-outline-danger" href="/logout">Logout</a>
            </li>
          </ul>
        </div>
      </header>
      <!-- Content -->
      <main class="flex-grow-1 p-4" :class="darkMode ? 'bg-dark text-light' : ''">
        <slot />
      </main>
      <!-- Footer -->
      <footer class="text-center py-3 border-top small" :class="darkMode ? 'bg-dark text-light border-secondary' : 'bg-white'">
        &copy; {{ new Date().getFullYear() }} FUMA Admin Dashboard
      </footer>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  min-height: 100vh;
  min-width: 60px;
  max-width: 220px;
  transition: width 0.2s;
  z-index: 100;
}
.nav-link.active {
  background: #2563eb !important;
  color: #fff !important;
}
.nav-link {
  color: #333;
}
.bg-dark .nav-link {
  color: #fff;
}
.bg-dark .nav-link.active {
  background: #1e40af !important;
}
</style>
