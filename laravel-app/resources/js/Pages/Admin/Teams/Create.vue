<template>
  <AuthenticatedLayout>
    <template #default>
      <div class="container py-4">
        <h2 class="mb-4">Tambah Tim</h2>
        <form @submit.prevent="submit">
          <div class="mb-3">
            <label class="form-label">Nama</label>
            <input v-model="form.name" type="text" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Short Name</label>
            <input v-model="form.short_name" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Nickname</label>
            <input v-model="form.nickname" type="text" class="form-control" />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Tahun Berdiri</label>
              <input v-model="form.founded_year" type="number" class="form-control" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Stadion</label>
              <input v-model="form.stadium" type="text" class="form-control" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kapasitas</label>
              <input v-model="form.capacity" type="number" class="form-control" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Kota</label>
              <input v-model="form.city" type="text" class="form-control" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Negara</label>
              <input v-model="form.country" type="text" class="form-control" />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Logo URL</label>
              <input v-model="form.logo_url" type="text" class="form-control" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Manager</label>
            <input v-model="form.manager" type="text" class="form-control" />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Coach</label>
              <select v-model="form.coach_id" class="form-select">
                <option value="">- Pilih Coach -</option>
                <option v-for="c in coaches" :key="c.id" :value="c.id">{{ c.full_name }}</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Turnamen</label>
              <select v-model="form.tournament_id" class="form-select" required>
                <option value="">- Pilih Turnamen -</option>
                <option v-for="t in tournaments" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" type="submit">Simpan</button>
        </form>
      </div>
    </template>
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { reactive } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
const props = defineProps({ tournaments: Array, coaches: Array })
usePage().props.title = 'Tambah Tim'
const form = reactive({
  name: '',
  short_name: '',
  nickname: '',
  founded_year: '',
  stadium: '',
  capacity: '',
  city: '',
  country: '',
  logo_url: '',
  manager: '',
  coach_id: '',
  tournament_id: '',
})
function submit() {
  router.post(route('admin.teams.store'), form)
}
</script>
