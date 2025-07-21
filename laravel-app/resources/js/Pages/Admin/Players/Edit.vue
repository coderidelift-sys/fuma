<template>
  <AuthenticatedLayout>
    <template #default>
      <div class="container py-4">
        <h2 class="mb-4">Edit Pemain</h2>
        <form @submit.prevent="submit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Depan</label>
              <input v-model="form.first_name" type="text" class="form-control" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Nama Belakang</label>
              <input v-model="form.last_name" type="text" class="form-control" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Nama Lengkap</label>
            <input v-model="form.full_name" type="text" class="form-control" required />
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Tanggal Lahir</label>
              <input v-model="form.date_of_birth" type="date" class="form-control" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Tempat Lahir</label>
              <input v-model="form.place_of_birth" type="text" class="form-control" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kewarganegaraan</label>
              <input v-model="form.nationality" type="text" class="form-control" />
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Tinggi (cm)</label>
              <input v-model="form.height" type="number" class="form-control" />
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Berat (kg)</label>
              <input v-model="form.weight" type="number" class="form-control" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Kaki Dominan</label>
              <select v-model="form.preferred_foot" class="form-select">
                <option value="">- Pilih -</option>
                <option value="right">Kanan</option>
                <option value="left">Kiri</option>
                <option value="both">Kedua</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">No. Punggung</label>
              <input v-model="form.jersey_number" type="number" class="form-control" />
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Posisi</label>
              <select v-model="form.position" class="form-select">
                <option value="">- Pilih -</option>
                <option value="GK">GK</option>
                <option value="DF">DF</option>
                <option value="MF">MF</option>
                <option value="FW">FW</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select" required>
                <option value="active">Aktif</option>
                <option value="injured">Cedera</option>
                <option value="suspended">Skorsing</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Tim</label>
              <select v-model="form.team_id" class="form-select" required>
                <option value="">- Pilih Tim -</option>
                <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Market Value</label>
            <input v-model="form.market_value" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Bio</label>
            <textarea v-model="form.bio" class="form-control"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Photo URL</label>
            <input v-model="form.photo_url" type="text" class="form-control" />
          </div>
          <button class="btn btn-primary" type="submit">Update</button>
        </form>
      </div>
    </template>
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { reactive } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
const props = defineProps({ player: Object, teams: Array })
usePage().props.title = 'Edit Pemain'
const form = reactive({
  first_name: props.player.first_name,
  last_name: props.player.last_name,
  full_name: props.player.full_name,
  date_of_birth: props.player.date_of_birth,
  place_of_birth: props.player.place_of_birth,
  nationality: props.player.nationality,
  height: props.player.height,
  weight: props.player.weight,
  preferred_foot: props.player.preferred_foot,
  jersey_number: props.player.jersey_number,
  position: props.player.position,
  status: props.player.status,
  market_value: props.player.market_value,
  bio: props.player.bio,
  photo_url: props.player.photo_url,
  team_id: props.player.team_id,
})
function submit() {
  router.put(route('admin.players.update', props.player.id), form)
}
</script>
