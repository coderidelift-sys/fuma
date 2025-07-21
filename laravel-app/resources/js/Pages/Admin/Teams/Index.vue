<template>
    <AuthenticatedLayout>
        <template #default>
            <div class="container py-4">
                <h2 class="mb-4">Daftar Tim</h2>
                <div class="mb-3">
                    <Link
                        :href="route('admin.teams.create')"
                        class="btn btn-success"
                    >
                        Tambah Tim
                    </Link>
                </div>
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Turnamen</th>
                            <th>Coach</th>
                            <th>Kota</th>
                            <th>Negara</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(t, i) in teams" :key="t.id">
                            <td>{{ i + 1 }}</td>
                            <td>{{ t.name }}</td>
                            <td>{{ t.tournament?.name }}</td>
                            <td>{{ t.coach?.full_name }}</td>
                            <td>{{ t.city }}</td>
                            <td>{{ t.country }}</td>
                            <td>
                                <Link
                                    :href="route('admin.teams.edit', t.id)"
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
const props = defineProps({ teams: Array });
import { usePage, Link } from "@inertiajs/vue3";
usePage().props.title = "Daftar Tim";
</script>
