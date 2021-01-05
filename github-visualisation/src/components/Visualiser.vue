<template> 
 
    <div id="Visualiser">
      <h1> GitHub API Visualiser </h1>
      
      <v-container>
        <v-row align="center" justify="center">
         <v-col></v-col>
          <v-col>
          <p> Enter a user name to search for:
            <v-text-field v-model="message" placeholder="userName" > </v-text-field>
          </p>
            <v-btn v-on:click="searchBtn" elevation="1">Search</v-btn>
        </v-col>
          <v-col></v-col>
       </v-row>
      </v-container>

      <v-container v-if="display">
        <div>
        <v-row align="center" justify="center">
          <v-col></v-col>
          <v-col align="center">
            
          </v-col> <v-col> 
          </v-col>
        </v-row>
        </div>

        
    <v-card class="mx-auto my-12">
     <div class="ma-4">
      <v-row align="center" justify="center"> 
        <v-col align="center">
           <v-card width="300">
             <h3 align="center"> {{searchTerm}} </h3>
             <v-img max-width="300px" :src = avatar align="center"> </v-img>
            </v-card>  
        </v-col>
        <v-col>
           <v-img max-width="600px" :src="userCard" align="center"> </v-img>
        </v-col>
        </v-row>
        <h2> Contributions in the last year </h2>
            <vue-chart-heatmap :selector="'OogaBooga'" :entries="calendar" :locale="locale" :colorRange="colors" :max="25" :tooltip-unit="'Contribution'" ></vue-chart-heatmap>  
      </div>

        <div>
          <h2>Network Graph </h2>
          <p> Red Lines indicate followers of this user</p>   
          <d3-network :net-nodes="nodes" :net-links="links" :options="options"></d3-network>
        </div>
        <div>
        <v-row>
          <v-col>
        <h2> Top languages by number of repositories </h2>
        <column-chart :data="languages"></column-chart>
          </v-col>
          <v-col>
        <h2> Top languages by number of commits </h2>
        <column-chart :data="commits"></column-chart>
          </v-col>
        </v-row>
        </div>  

        <div>
        <v-row>
          <v-col></v-col>
           <v-col :cols="6">
             <h2> Commit Times </h2>
              <scatter-chart :data="scatter" xtitle="Time" ytitle="Day of the week" :xmax="24"></scatter-chart>
            </v-col>
          <v-col></v-col>
        </v-row>
        </div>
       </v-card>

      </v-container>
    </div>
  
</template>

<script>

import axios from "axios";
import VueChartHeatmap from 'vue-chart-heatmap'
import D3Network from 'vue-d3-network'
export default {
  name: 'Visualiser',
  components: {
     VueChartHeatmap,
     D3Network
    },
   methods: {
    searchBtn : function() {
      this.searchTerm = this.message
      this.display = true
        axios.get(`https://api.github.com/users/${this.searchTerm}`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then(respone => {
      this.info = respone

      //console.log(this.info)
      this.getData()
      this.getEvents()
      this.getLanguageData()
      this.getContributions()
      this.getNetwork()
      
      })
    },
    getData() {
      this.avatar = this.info.data.avatar_url
      this.userCard = "https://github-readme-stats.vercel.app/api?username=" + this.searchTerm;
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
  getEvents() {
    this.pageNum = 0
    this.scatter = []
  for(let i = 0; i < 10; i++) {
    this.pageNum = this.pageNum + 1
    axios.get(`https://api.github.com/users/${this.searchTerm}/events?page=${this.pageNum}`, {
         headers: {
           authorization: "token " + process.env.VUE_APP_API_KEY
        }, timeout:10000
       })
       .then (response => {
         for( let j = 0; j < response.data.length; j++) {
          
            this.date = new Date (response.data[j].created_at)
            this.day = this.date.getDay()
            // switch(this.day)
            // {
            //   case 0:
            //     this.day = "Monday"
            //     break;
            //   case 1:
            //     this.day = "Tuesday"
            //     break;
            //   case 2:
            //     this.day = "Monday"
            //     break;
            //   case 3:
            //     this.day = "Wednesday"
            //     break;
            //   case 4:
            //     this.day = "Friday"
            //     break;
            //   case 5:
            //     this.day = "Saturday"
            //     break;
            //   case 6:
            //     this.day = "Sunday"
            //     break;
            // }
            this.hours = this.date.getHours()
            this.time = this.date.getHours() + '.' + this.date.getMinutes() + '.' + this.date.getSeconds()
            this.scatter.push([this.time, this.day,])
         }
       })
    }
    console.log(this.scatter)
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
    getNetwork() {
      axios.get(`https://api.github.com/users/${this.searchTerm}/followers?per_page=20`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then (response => {
        this.nodes = []
        this.links = []
        //this.nodeID = 1
        this.followers = response.data
        console.log(this.followers.length)
        this.nodes.push({id: 0, name: this.searchTerm})
        for (let i = 0; i < this.followers.length; i++) {
          this.nodes.push({id: this.followers[i].login, name: this.followers[i].login})
          this.links.push({sid: 0, tid: this.followers[i].login, _color:'red'})
          //this.nodeID = this.nodeID + 1
        }
        this.getSecondDegree()
      })   
    },
    getSecondDegree() {
      for (let i = 0; i < this.followers.length; i++) {
          this.secondDegree = []
           axios.get(`https://api.github.com/users/${this.followers[i].login}/followers?per_page=50`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then (response => {
        this.secondDegree = response.data
        console.log(this.secondDegree)
        for(let j = 0; j < this.secondDegree.length; j++)
        {
          if(!this.nodes.some((node) => node.name == (this.secondDegree[j].login))) 
          {
            this.nodes.push({id: this.secondDegree[j].login, name: this.secondDegree[j].login})
            this.links.push({sid: this.followers[i].login, tid: this.secondDegree[j].login, _color:'#'+(Math.random()*0xFFFFFF<<0).toString(16)})
       
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
    console.log(data)
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
      display: false,
      followers: [],
      secondDegree: [],
      scatter: [],
      nodeID: 0, 
      day: null,
      hours: '',
      time: '',
      date: '',
      loop: false,
      pageNum: 1,
      pageSize: 0,
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
      colors: ['#f9fcf8', '#4cbc19'],
      locale: 
      {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        No: 'No',
        on: 'on',
        Less: 'Less',
        More: 'More'
      },
      nodes: [],
      links: [],
      options:
      {
        force: 400,
        nodeSize: 10,
        nodeLabels: true,
        linkWidth:4
      }     
  })
}
</script>