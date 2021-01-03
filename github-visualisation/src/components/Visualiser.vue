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
      <div>
        <column-chart :data="test"></column-chart>
      </div>
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
      this.getLanguageData()
      axios.get(`https://api.github.com/users/${this.searchTerm}`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then(respone => {
      this.info = respone
      this.getData()
      this.getLanguageData()
      })
    },
    getData() {
      this.avatar = this.info.data.avatar_url
      this.userCard = "https://github-readme-stats.vercel.app/api?username=" + this.searchTerm;
      console.log(this.info.data.repos_url)    
    },
    getLanguageData() {
      this.test  = []
      this.test.push(["A", 3])
      this.test.push(["b", 2])
      this.test.push(["c", 1])
    }
  }, 
  data: () => ({
      message: "", 
      searchTerm:"", 
      info: null,
      avatar:"",
      userCard:"",
      commits: [],
      languages: [],
      test: [["A", 1],["B", 2],["C", 3]]
  })
}
</script>