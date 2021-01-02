<template> 
    <div id="Visualiser">
      <v-container>
      <h1> GitHub API Visualiser </h1>
      <input v-model="message" placeholder="userName">
      <p>Search GitHub for {{ message }} ?</p>  
      <button v-on:click="searchBtn">Yes!</button>
      <p>Searching for {{searchTerm}}</p>
      <v-card-title class="justify-center">
      <v-img max-width="200px" :src = avatar align="center"> </v-img>
      </v-card-title>
      <v-img maxwidth="200px" :src="userCard"> </v-img>
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
      this.userCard = "https://github-readme-stats.vercel.app/api?username=" + this.searchTerm;
      console.log(this.info.data.repos_url)    
  }
  }, 
  data: () => ({
      message: "", 
      searchTerm:"", 
      info: null,
      avatar:"",
      userCard:"",
      commits: []
  })
}
</script>