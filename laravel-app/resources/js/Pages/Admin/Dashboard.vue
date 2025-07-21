<template>
  <AuthenticatedLayout>
    <template #default>
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card shadow-sm rounded-4">
              <div class="card-body">
                <h1 class="mb-4">Admin Dashboard</h1>
                <p>Selamat datang di dashboard admin FUMA. Silakan kembangkan fitur manajemen turnamen, tim, pemain, dan statistik di sini.</p>
                <hr />
                <div class="alert alert-info rounded-3">
                  <strong>Info:</strong> Ini adalah halaman awal dashboard admin berbasis Inertia + Vue + Bootstrap 5.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { usePage } from '@inertiajs/vue3'
usePage().props.title = 'Dashboard Admin'
// Tambahkan logic dashboard admin di sini
</script>
