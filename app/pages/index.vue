<script setup lang="ts">
const store = useAuthStore()
store.hydrate()

await navigateTo(store.isAuthenticated ? '/dashboard' : '/login', { replace: true })
</script>
