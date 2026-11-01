<template>
  <AdminLayout>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold">Welcome to My Website 🚀</h1>
      <p class="text-gray-300 mt-2">
        “Thanks” for visiting! Fill out the form and send it to the API.
      </p>
    </div>

    <form
      @submit.prevent="apiCall"
      class="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4"
    >
      <div>
        <label class="block mb-1 text-sm font-medium">First Name</label>
        <input v-model="form.firstName" type="text" class="input-field" placeholder="Enter first name" />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">Last Name</label>
        <input v-model="form.lastName" type="text" class="input-field" placeholder="Enter last name" />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">Email</label>
        <input v-model="form.email" type="email" class="input-field" placeholder="Enter email" />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">Phone</label>
        <input v-model="form.phone" type="text" class="input-field" placeholder="+91 99999 99999" />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">Gender</label>
        <select v-model="form.gender" class="input-field">
          <option value="" disabled>Select gender</option>
          <option>male</option>
          <option>female</option>
        </select>
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        Run API
      </button>
    </form>




      <div>
        <label class="block mb-1 text-sm font-medium">{{form.firstName}}</label>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">{{form.lastName.toUpperCase()}}</label>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">{{form.email}}</label>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">{{form.phone}}</label>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">{{form.gender}}</label>
        <select v-model="form.gender" class="input-field">

        </select>
      </div>
  </div>
  </AdminLayout>
</template>

<script setup>
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { ref } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: ''
})

const apiCall = async () => {
  try {
    const res = await axios.post('/call/api/run', {
      id: 1,
      ...form.value,
      username: form.value.firstName.toUpperCase(),
      password: 'defaultpass',
      birthDate: '1996-05-30',
      image: 'https://via.placeholder.com/150',
      bloodGroup: 'O+',
      height: 170,
      weight: 60,
      eyeColor: 'Brown'
    })
    console.log('✅ API Response:', res.data)
    alert('Data sent successfully!')
  } catch (err) {
    console.error('❌ Error:', err)
    alert('Error sending data')
  }
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #1f2937;
  color: white;
}
.input-field:focus {
  border: 1px solid #3b82f6;
  background: #111827;
}
</style>
