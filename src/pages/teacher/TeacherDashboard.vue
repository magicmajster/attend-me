<template>
  <div class="teacher-dashboard">
    <h1>Pulpit wykładowcy</h1>

    <div v-if="loading">Ładowanie listy zajęć...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="filters">
  <select v-model="selectedFilter" @change="applyFilter">
    <option value="all">Wszystkie</option>
    <option value="today">Dziś</option>
    <option value="tomorrow">Jutro</option>
    <option value="nextWeek">Następny tydzień</option>
    <option value="past">Minione</option>
  </select>
</div>

    <table v-if="sessions && sessions.items.length > 0" class="sessions-table">
      <thead>
        <tr>
          <th>Nazwa przedmiotu</th>
          <th>Grupa</th>
          <th>Data</th>
          <th>Godzina</th>
          <th>Lokalizacja</th>
        </tr>
      </thead>
      <tbody>
  <tr 
    v-for="session in sessions.items" 
    :key="session.courseSessionId" 
    @click="goToSessionDetails(session.courseSessionId)" 
    class="clickable-row"
  >
    <td>{{ session.courseName }}</td>
    <td>{{ session.courseGroupName }}</td>
    <td>{{ formatDate(session.dateStart) }}</td>
    <td>
      {{ formatTime(session.dateStart) }} - 
      {{ formatTime(session.dateEnd) }}
    </td>
    <td>{{ session.locationName }}</td>
  </tr>
</tbody>
    </table>

    <div v-else-if="!loading && sessions?.items.length === 0">
      Brak zajęć do wyświetlenia.
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Backend } from "@/api/backend";
import type { CourseSessionListItem, CourseSessionListItemPagedList, CourseSessionAttendanceRecord } from "@/api/models";

export default {
  name: "TeacherDashboard",
  setup() {
    const sessions = ref<CourseSessionListItemPagedList | null>(null);
    const loading = ref(false);
    const error = ref("");
    const router = useRouter();

    const fetchSessions = async () => {
  loading.value = true;
  error.value = "";

  try {
    const result = await Backend.courseTeacherSessionsGet({
      pageNumber: 1,
      pageSize: 999999
    });

    // Mapowanie na pewne typy
    sessions.value = {
      items: result.items.map(s => ({
        courseSessionId: s.courseSessionId ?? 0,
        courseName: s.courseName ?? "",
        courseGroupName: s.courseGroupName ?? "",
        dateStart: s.dateStart ?? new Date(),
        dateEnd: s.dateEnd ?? new Date(),
        locationName: s.locationName ?? ""
      })),
      totalCount: result.totalCount,
      pageNumber: result.pageNumber,
      pageSize: result.pageSize,
      totalPages: result.totalPages
    };
    allSessions.value = sessions.value.items;
  } catch (err: any) {
    console.error("Błąd pobierania sesji:", err);
    error.value = "Nie udało się pobrać listy zajęć.";
  } finally {
    loading.value = false;
  }
};

    const goToSessionDetails = (sessionId: number) => {
      router.push(`/teacher/session/${sessionId}`);
    };

    onMounted(() => {
      fetchSessions();
    });
    const selectedFilter = ref("all");
const allSessions = ref<any[]>([]);

const applyFilter = () => {
  const now = new Date();

  switch (selectedFilter.value) {
    case "today":
      sessions.value!.items = allSessions.value.filter(s =>
        new Date(s.dateStart).toDateString() === now.toDateString()
      );
      break;

    case "tomorrow":
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      sessions.value!.items = allSessions.value.filter(s =>
        new Date(s.dateStart).toDateString() === tomorrow.toDateString()
      );
      break;

    case "nextWeek":
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      sessions.value!.items = allSessions.value.filter(s =>
        new Date(s.dateStart) > now &&
        new Date(s.dateStart) <= nextWeek
      );
      break;

    case "past":
      sessions.value!.items = allSessions.value.filter(s =>
        new Date(s.dateStart) < now
      );
      break;

    default:
      sessions.value!.items = allSessions.value;
  }
};

return {
  sessions,
  loading,
  error,
  goToSessionDetails,
  fetchSessions,
  formatDate,
  formatTime,
  selectedFilter,
  applyFilter
};
  }
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("pl-PL");

const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit"
  });
</script>

<style scoped>
.teacher-dashboard {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
}

.error {
  color: red;
  margin-bottom: 15px;
}

.sessions-table {
  width: 100%;
  border-collapse: collapse;
}

.sessions-table th,
.sessions-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #f0f0f0;
}
</style>