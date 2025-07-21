<template>
  <AuthenticatedLayout>
    <template #default>
      <div class="container py-4">
        <h2 class="mb-4">Tambah Turnamen</h2>
        <form @submit.prevent="submit">
          <div class="mb-3">
            <label class="form-label">Nama</label>
            <input v-model="form.name" type="text" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Deskripsi</label>
            <textarea v-model="form.description" class="form-control"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Logo URL</label>
            <input v-model="form.logo_url" type="text" class="form-control" />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Tanggal Mulai</label>
              <input v-model="form.start_date" type="date" class="form-control" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Tanggal Selesai</label>
              <input v-model="form.end_date" type="date" class="form-control" required />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select" required>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Tipe</label>
              <select v-model="form.type" class="form-select" required>
                <option value="league">League</option>
                <option value="cup">Cup</option>
                <option value="friendly">Friendly</option>
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
const props = defineProps({})
usePage().props.title = 'Tambah Turnamen'

const form = reactive({
  name: '',
  description: '',
  logo_url: '',
  start_date: '',
  end_date: '',
  status: 'upcoming',
  type: 'league',
})

function submit() {
  router.post(route('admin.tournaments.store'), form)
}
</script>
