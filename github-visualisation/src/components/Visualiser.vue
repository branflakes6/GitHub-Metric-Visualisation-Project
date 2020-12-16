<template> 
    <div id="Visualiser">
      <h1> GitHub API Visualiser </h1>
      <input v-model="message" placeholder="userName">
      <p>Search GitHub for {{ message }} ?</p>  
      <button v-on:click="searchBtn">Yes!</button>
      <p>Searching for {{searchTerm}}</p>
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
      axios.get(`https://api.github.com/users/${this.searchTerm}`)
      .then(respone => (this.info = respone))
    }
  },
  data () {
    return{message: "", searchTerm:"", info: null
    }
  }
 
}

</script>