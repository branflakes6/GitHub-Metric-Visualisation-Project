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
      <v-img max-width="800px" :src="userCard"> </v-img>
      <div>
        <p> Top Languages by Number of Repos </p>
        <column-chart :data="languages"></column-chart>
      </div>
      <div>
        <p> Top Languages by Number of commits </p>
        <column-chart :data="commits"></column-chart>
      </div>
      <div>
        <p> Heres a heatmap for you to look at </p>
        <vuejs-heatmap :selector="'OogaBooga'" :entries="calendar" :locale="locale" :colorRange="colors" :max="50"  ></vuejs-heatmap> 
      </div>
      </v-container>
    </div>
</template>

<script>

import axios from "axios";
import VuejsHeatmap from 'vuejs-heatmap'
export default {
  name: 'Visualiser',
  components: {
     VuejsHeatmap
    },
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
      //this.getLanguageData()
      this.getContributions()
      
      })
    },
    getData() {
      this.avatar = this.info.data.avatar_url
      this.userCard = "https://github-readme-stats.vercel.app/api?username=" + this.searchTerm;
      //console.log(this.info.data.repos_url)    
    },
    getLanguageData() {
       axios.get(`https://api.github.com/users/${this.searchTerm}/repos?per_page=100`, {
         headers: {
           authorization: "token " + process.env.VUE_APP_API_KEY
        }
       })
         .then(respone => {
           this.repoInfo = respone
           this.languages = []
          
          for (let i = 0; i < this.repoInfo.data.length; i++) {
          if(!this.languages.some(row => row.includes(this.repoInfo.data[i].language)))
          {
            if(this.repoInfo.data[i].language != null)
            this.languages.push([this.repoInfo.data[i].language,1])
          }
          else{
            for(let j = 0; j < this.languages.length; j++)
            {
              if(this.languages[j][0] == this.repoInfo.data[i].language)
              {
                this.languages[j][1] = this.languages[j][1] + 1
              }
            }
          }
        }
        this.getCommitData()
      })
  },
  getCommitData() {
        this.commits = []
        for (let i = 0; i < this.repoInfo.data.length; i++) {
          axios.get(`https://api.github.com/repos/${this.searchTerm}/${this.repoInfo.data[i].name}/stats/contributors`, {
            headers: {
            authorization: "token " + process.env.VUE_APP_API_KEY
        }
       })
       .then (response => {
         this.currentRepoCommits = response
         
         if(this.repoInfo.data[i].language != null){
          if(!this.commits.some(row => row.includes(this.repoInfo.data[i].language)))
          {
              for(let k = 0; k < this.currentRepoCommits.data.length; k++)
              {
                if (this.currentRepoCommits.data[k].author.login == this.searchTerm)
                {
                  this.commits.push([this.repoInfo.data[i].language, this.currentRepoCommits.data[k].total])
                }
              }     
          }
          else{
            for(let j = 0; j < this.commits.length; j++)
            {
              if(this.commits[j][0] == this.repoInfo.data[i].language)
              {
                for(let k = 0; k < this.currentRepoCommits.data.length; k++)
                {
                  if (this.currentRepoCommits.data[k].author.login == this.searchTerm)
                  {
                    this.commits[j][1] = this.commits[j][1] + this.currentRepoCommits.data[k].total
                  }
                }     
              }
            }
          }
         }
        })
      }
    },
    async getContributions() {
      console.log("here")
          const headers = {
          'Authorization': `bearer ${process.env.VUE_APP_API_KEY}`,
          }
      const body = {
          "query": `query {
              user(login: "${this.searchTerm}") {
                name
                contributionsCollection {
                  contributionCalendar {
                    colors
                    totalContributions
                    weeks {
                      contributionDays {
                        color
                        contributionCount
                        date
                        weekday
                      }
                      firstDay
                    }
                  }
                }
              }
            }`
      }
    const response = await fetch('https://api.github.com/graphql', { method: 'POST', body: JSON.stringify(body), headers: headers })
    const data = await response.json()
    this.weeks = data.data.user.contributionsCollection.contributionCalendar.weeks
    this.calendar = []
    for(let i = 0; i < this.weeks.length; i++)
    {
      for (let j = 0; j < this.weeks[i].contributionDays.length; j++){
          this.calendar.push( {counting: this.weeks[i].contributionDays[j].contributionCount, created_at: this.weeks[i].contributionDays[j].date})
      }
      
    }
    console.log(this.calendar)
    }
   },
  data: () => ({
      message: "", 
      searchTerm:"", 
      info: null,
      repoInfo: null,
      avatar:"",
      userCard:"",
      commits: [],
      languages: [],
      currentRepoCommits:"",
      week: [],
      calendar: [],
      colors: ['#c9ecec', '#09b3af'],
      locale: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        No: 'No',
        on: 'on',
        Less: 'Less',
        More: 'More'
      }
  })
}
</script>