<template>
  <AuthenticatedLayout>
    <template #default>
      <div class="container py-4">
        <h2 class="mb-4">Daftar Pemain</h2>
        <table class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama</th>
              <th>Tim</th>
              <th>Posisi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in players" :key="p.id">
              <td>{{ i+1 }}</td>
              <td>{{ p.full_name }}</td>
              <td>{{ p.team?.name }}</td>
              <td>{{ p.position }}</td>
              <td><span class="badge bg-info">{{ p.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
const props = defineProps({ players: Array })
import { usePage } from '@inertiajs/vue3'
usePage().props.title = 'Daftar Pemain'
</script>
