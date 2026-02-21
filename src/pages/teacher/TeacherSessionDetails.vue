<template>
  <div class="session-details">
    <h2>Szczegóły zajęć</h2>

    <div v-if="loading">Ładowanie...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="session">
      <h3>{{ session.courseName }} | {{ session.courseGroupName }}</h3>

      <p>
        {{ formatDate(session.dateStart) }}
        {{ formatTime(session.dateStart) }} -
        {{ formatTime(session.dateEnd) }}
      </p>

      <p>Lokalizacja: {{ session.locationName }}</p>

      <button @click="fetchAttendance">Odśwież listę obecności</button>

      <!-- PRZYCISK URUCHAMIANIA QR -->
      <button @click="goToQRCode" class="qr-button">
        Uruchom rejestrację przez QR
      </button>

      <h3>Lista obecności</h3>

      <table v-if="attendance.length > 0">
        <thead>
          <tr>
            <th>Imię i nazwisko</th>
            <th>Nr indeksu</th>
            <th>Obecny</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in attendance" :key="student.attenderUserId">
            <td>{{ student.userName }} {{ student.userSurname }}</td>
            <td>{{ student.studentAlbumIdNumber }}</td>
            <td>
              <input
                type="checkbox"
                :checked="student.wasUserPresent"
                @change="toggleAttendance(student)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else>Brak studentów.</div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Backend } from "@/api/backend";
import type {
  CourseSessionListItem,
  CourseSessionAttendanceRecord,
} from "@/api/AttendMeBackendClientBase";

export default {
  name: "TeacherSessionDetails",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const sessionId = Number(route.params.id);

    const session = ref<CourseSessionListItem | null>(null);
    const attendance = ref<CourseSessionAttendanceRecord[]>([]);
    const loading = ref(false);
    const error = ref("");

    const fetchSession = async () => {
      try {
        session.value = await Backend.courseTeacherSessionGet(sessionId);
      } catch (err) {
        console.error(err);
        error.value = "Nie udało się pobrać szczegółów zajęć.";
      }
    };

    const fetchAttendance = async () => {
      try {
        const result = await Backend.courseSessionAttendanceListGet(sessionId);
        attendance.value = result.map((s) => ({
          attenderUserId: s.attenderUserId,
          userName: s.userName,
          userSurname: s.userSurname,
          studentAlbumIdNumber: s.studentAlbumIdNumber,
          wasUserPresent: s.wasUserPresent,
        }));
      } catch (err) {
        console.error(err);
        error.value = "Nie udało się pobrać listy obecności.";
      }
    };

    const toggleAttendance = async (student: CourseSessionAttendanceRecord) => {
      try {
        await Backend.courseSessionAttendanceToggle(
          student.attenderUserId,
          sessionId,
          !student.wasUserPresent
        );

        attendance.value = attendance.value.map((s) =>
          s.attenderUserId === student.attenderUserId
            ? { ...s, wasUserPresent: !s.wasUserPresent }
            : s
        );
      } catch (err) {
        console.error(err);
        error.value = "Nie udało się zaktualizować obecności.";
      }
    };

    // NOWA FUNKCJA – przejście do ekranu QR
    const goToQRCode = () => {
      router.push({ name: "TeacherAttendanceQR", query: { sessionId } });
    };

    const formatDate = (date?: string | Date) =>
      date ? new Date(date).toLocaleDateString("pl-PL") : "";
    const formatTime = (date?: string | Date) =>
      date
        ? new Date(date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
        : "";

    onMounted(async () => {
      loading.value = true;
      await fetchSession();
      await fetchAttendance();
      loading.value = false;
    });

    return {
      session,
      attendance,
      loading,
      error,
      fetchAttendance,
      toggleAttendance,
      goToQRCode,
      formatDate,
      formatTime,
    };
  },
};
</script>

<style scoped>
.session-details {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
}

.error {
  color: red;
  margin-bottom: 15px;
}

.qr-button {
  margin-top: 10px;
  margin-bottom: 20px;
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.qr-button:hover {
  background-color: #0056b3;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.present {
  color: green;
  font-weight: bold;
}

.absent {
  color: red;
  font-weight: bold;
}
</style>