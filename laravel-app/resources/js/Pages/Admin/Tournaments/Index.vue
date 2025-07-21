<template>
    <AuthenticatedLayout>
        <template #default>
            <div class="container py-4">
                <h2 class="mb-4">Daftar Turnamen</h2>
                <div class="mb-3">
                    <Link
                        :href="route('admin.tournaments.create')"
                        class="btn btn-success"
                    >
                        Tambah Turnamen
                    </Link>
                </div>
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Deskripsi</th>
                            <th>Periode</th>
                            <th>Status</th>
                            <th>Tipe</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(t, i) in tournaments" :key="t.id">
                            <td>{{ i + 1 }}</td>
                            <td>{{ t.name }}</td>
                            <td>{{ t.description }}</td>
                            <td>{{ t.start_date }} - {{ t.end_date }}</td>
                            <td>
                                <span class="badge bg-info">{{
                                    t.status
                                }}</span>
                            </td>
                            <td>{{ t.type }}</td>
                            <td>
                                <Link
                                    :href="route('admin.tournaments.edit', t.id)"
                                    class="btn btn-primary btn-sm"
                                >
                                    Edit
                                </Link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </AuthenticatedLayout>
</template>

<script setup>
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.vue";
const props = defineProps({ tournaments: Array });
// Set judul halaman untuk topbar
import { usePage, Link } from "@inertiajs/vue3";
usePage().props.title = "Daftar Turnamen";
</script>
