<template> 
    <div id="Visualiser">
      <v-container>
      <h1> GitHub API Visualiser </h1>
      <input v-model="message" placeholder="userName">
      <p>Search GitHub for {{ message }} ?</p>  
      <button v-on:click="searchBtn">Yes!</button>
      <p>Searching for {{searchTerm}}</p>

      <v-img max-width="500px" :src = avatar> </v-img>
      </v-container>
      <div>  
        {{info}}
      </div>
    </div>
</template>


<script>
import axios from "axios";
export default {
  name: 'Visualiser',
   methods: {
    searchBtn : function() {
      this.searchTerm = this.message
      axios.get(`https://api.github.com/users/${this.searchTerm}`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then(respone => {
      this.info = respone
      this.getData()
      })
    },
    getData() {
      this.avatar = this.info.data.avatar_url
      console.log(this.avatar)    
  }
  }, 
  data: () => ({
      message: "", 
      searchTerm:"", 
      info: null,
      avatar:""
  })
}
</script>