<template>
  <div id="app">    
    <Visualiser msg="GitHub API Visualiser"/>
    <img alt="Orangutan" src="./assets/Orangutan.png" contain height ="60px" width = "60px">
  </div>
</template>

<script>
import Visualiser from './components/Visualiser.vue'

export default {
  name: 'App',
  components: {
    Visualiser
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
