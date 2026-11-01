<template>
  <AdminLayout>
   <PageBreadcrumb :pageTitle="currentPageTitle" />
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">🖼️ Image OSINT Analyzer</h1>
    <input type="file" @change="handleFileUpload" />
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      @click="uploadImage"
    >
      Upload Image
    </button>

    <div v-if="imageUrl" class="mt-4">
      <h3 class="font-semibold mb-2">Preview:</h3>
      <img :src="imageUrl" alt="Uploaded" class="w-64 rounded-lg shadow-md" />
    </div>

    <div v-if="analysis" class="mt-6 bg-gray-100 p-4 rounded-lg">
      <h3 class="font-semibold mb-2">🧠 Analysis Result:</h3>
      <pre>{{ analysis }}</pre>
    </div>
  </div>
  </AdminLayout>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const selectedFile = ref(null);
const imageUrl = ref("");
const analysis = ref(null);

function handleFileUpload(e) {
  selectedFile.value = e.target.files[0];
}

async function uploadImage() {
  if (!selectedFile.value) return alert("Please select an image first!");

  const formData = new FormData();
  formData.append("image", selectedFile.value);

  try {
    // ✅ Correct backend URL
    const uploadRes = await axios.post(
      "/api/image-osint/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    imageUrl.value = `${axios.defaults.baseURL || ''}${uploadRes.data.path}`;

    // Now analyze it
    const analyzeRes = await axios.post(
      "/api/image-osint/analyze",
      { imageUrl: imageUrl.value }
    );

    analysis.value = analyzeRes.data.analysis;
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}
</script>
