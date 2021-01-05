<template> 
  <v-app>
    <div id="Visualiser">
      <h1> GitHub API Visualiser </h1>
      
      <v-container>
        
        <v-row align="center" justify="center">
         <v-col></v-col>
          <v-col>
          <p> Enter a user name to search for:  </p>
            <v-text-field v-model="message" placeholder="userName or userName/repoName" > </v-text-field>
           
               <v-select data-app :items="items" v-model="select" label="Users or Repos"> </v-select>  
             
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
       
    <v-card > 
     <div class="ma-4">
      <v-row align="center" justify="center" class = "ma-8"> 
        <v-col align="center">  </v-col>
        <v-card  width="230" style ="margin: 3rem">
             <h3 align="center"> {{searchTerm}} </h3>
             <v-img max-width="230px" :src = avatar align="center" > </v-img>
            </v-card>  
        <v-col></v-col>
      </v-row>
        <v-row>
          <v-col></v-col>
           <v-col>  
            <v-img max-width="600px" :src="userCard" align="center"> </v-img>
           </v-col>
          <v-col></v-col>
        </v-row>   
        <div  style ="margin: 3rem"> 
        <h2> Contributions in the last year </h2>
            <vue-chart-heatmap :selector="'OogaBooga'" :entries="calendar" :locale="locale" :colorRange="colors" :max="25" :tooltip-unit="'Contribution' " ></vue-chart-heatmap>  
        </div>
      </div>

      <div>
          <h2>Network Graph </h2>
          <p> Red Lines indicate followers of this user</p>   
          <d3-network :net-nodes="nodes" :net-links="links" :options="options"></d3-network>
        </div>
        <div  style ="margin: 3rem">
        <v-row >
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

     <v-container v-if="drawRepo">
       <h2> Commits over time </h2> 
       <line-chart :data="consOverTime" :borderDash="12"></line-chart>
       <h2> Users by number of commits </h2>
      <v-row style="margin: 3rem">
        <v-col>
       <column-chart :data="allCons"></column-chart>
        </v-col>
        <v-col>
       <pie-chart :data="allCons" :donut="true"></pie-chart>
        </v-col>
      </v-row>

      <h2>Top three Users </h2>
      <v-row style="margin: 2rem">
        <v-col>
      <column-chart :data="topFive"></column-chart>
        </v-col>
        <v-col>
       <pie-chart :data="topFive" :donut="true"></pie-chart>
        </v-col>
      </v-row>
      <!-- <geo-chart adapter="google"></geo-chart> -->
     </v-container>
    </div>
    </v-app>
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
       if(this.select == "Users")
       {
         this.searchBtnUser()
       }
       else if (this.select == "Repositories")
       {
         this.searchBtnRepo()
       }
     },
    searchBtnUser () {
      this.searchTerm = this.message
      this.display = true
      this.drawRepo = false
      this.scatter = []
        axios.get(`https://api.github.com/users/${this.searchTerm}`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then(respone => {
      this.info = respone
      this.getData()
      this.getEvents(1)
      this.getLanguageData()
      this.getContributions()
      this.getNetwork()
      })
      .catch(error => {
            this.display = false
            this.drawRepo = false
            console.log(error)
          })
    },
    searchBtnRepo () {
      this.searchTerm = this.message
      this.drawRepo = true
      this.display = false
      this.allCons = []
      this.consOverTime = []
       axios.get(`https://api.github.com/repos/${this.searchTerm}`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then (response => {
        this.info = response
        this.getTopCons(1)
      })
      .catch(error => {
          this.display = false
          this.drawRepo = false
          console.log(error)
          })
    },
    getTopCons(page) {
       axios.get(`https://api.github.com/repos/${this.searchTerm}/commits?page=${page}`, {
        headers: {
          authorization: "token " + process.env.VUE_APP_API_KEY
        }
      })
      .then (response => {
        let allCommits = response
         let data = {}
        for(let i = 0; i < allCommits.data.length; i++) {
          
          if(allCommits.data[i].author != null) {
            if(!this.allCons.some(row => row.includes(allCommits.data[i].author.login))) {
              this.allCons.push([allCommits.data[i].author.login, 1, allCommits.data[i].author.avatar_url])
              let date = new Date(allCommits.data[i].commit.author.date)
              data = {}
              let month = date.getUTCMonth()
              if (month < 10)
              {
                month = "0" + month
              }
              let day = date.getUTCDay()
              if (day < 10)
              {
                day = "0" + day
              }
              let commitDay = month + "-" + day
              console.log(commitDay)
              data[commitDay] = 1
              this.consOverTime.push({name: allCommits.data[i].author.login, data: data})
              console.log(this.consOverTime)
            }
            else {
              for(let j = 0; j < this.allCons.length; j++) {
                  if(allCommits.data[i].author.login == this.allCons[j][0])
                  {
                    this.allCons[j][1] = this.allCons[j][1] + 1
                  }
              }
              for(let j = 0; j < this.consOverTime.length; j++) {
                if(allCommits.data[i].author.login == this.consOverTime[j].name)
                {
                  let date = new Date(allCommits.data[i].commit.author.date)
                  let month = date.getUTCMonth()
                  if (month < 10)
                  {
                    month = "0" + month
                  }
                  let day = date.getUTCDay()
                  if (day < 10)
                  {
                     day = "0" + day
                  }
                let commitDay =  month + "-" + day
                if(this.consOverTime[j].data[commitDay] >= 1)
                {
                  this.consOverTime[j].data[commitDay] = this.consOverTime[j].data[commitDay] + 1
                }
                else {
                  this.consOverTime[j].data[commitDay] = 1
                }
                }
              }
            }
          }
        }
        if (allCommits.data.length >= 30) {
          this.getTopCons(page + 1)
        }
         this.allCons.sort((a, b) => (a[1] > b[1]) ? -1 : (b[1] > a[1]) ? 1 : 0);
         this.getTopFive()
      })
        .catch(error => {
            this.display = false
            this.drawRepo = false
            console.log(error)
          })
    },
    getTopFive() {
      this.topFive = []
        for(let i = 0; i < 3 && i < this.allCons.length; i++) {
          this.topFive[i] = this.allCons[i]
        }    
    },
    getLocationData() {
      this.locations = []


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
        .catch(error => {
            this.display = false
            this.drawRepo = false
            console.log(error)
          })
  },
  getEvents(pageNum) {
    axios.get(`https://api.github.com/users/${this.searchTerm}/events?per_page=100&page=${pageNum}`, {
         headers: {
           authorization: "token " + process.env.VUE_APP_API_KEY
        }, timeout:10000
       })
       .then (response => {
         for( let j = 0; j < response.data.length; j++) {
            
            this.date = new Date (response.data[j].created_at)
            this.day = this.date.getDay()
            this.hours = this.date.getHours()
            this.time = this.date.getHours() + '.' + this.date.getMinutes() + '.' + this.date.getSeconds()
            this.scatter.push([this.time, this.day,])
            
         }
       if(response.data.length >= 100)
       {
         this.getEvents(pageNum + 1)
       }
       }) 
         .catch(error => {
            this.display = false
            this.drawRepo = false
            console.log(error)
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
          .catch(error => {
            this.display = false
            this.drawRepo = false
            console.log(error)
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
        this.followers = response.data
        this.nodes.push({id: 0, name: this.searchTerm})
        for (let i = 0; i < this.followers.length; i++) {
          this.nodes.push({id: this.followers[i].login, name: this.followers[i].login})
          this.links.push({sid: 0, tid: this.followers[i].login, _color:'red'})
        }
        this.getSecondDegree()
      }) 
        .catch(error => {
            this.display = false
            this.drawRepo = false
            console.log(error)
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

        for(let j = 0; j < this.secondDegree.length; j++)
        {
          if(!this.nodes.some((node) => node.name == (this.secondDegree[j].login))) 
          {
            this.nodes.push({id: this.secondDegree[j].login, name: this.secondDegree[j].login})
            this.links.push({sid: this.followers[i].login, tid: this.secondDegree[j].login, _color:'#'+(Math.random()*0xFFFFFF<<0).toString(16)})
       
          }
        }     
      })
        .catch(error => {
            this.display = false
            this.drawRepo = false
            console.log(error)
          })
    }
    },
    async getContributions() {
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
    }
   },
  data: () => ({
      message: "",
      display: false,
      select: "",
      drawRepo: false,
      followers: [],
      secondDegree: [],
      consOverTime: [],
      scatter: [],
      locations: [],
      topFive: [],
      topFivePics: [],
      allCons: [],
      nodeID: 0, 
      day: null,
      hours: '',
      time: '',
      date: '',
      loop: false,
      pageSize: 0,
      searchTerm:"", 
      info: null,
      repoInfo: null,
      avatar:"",
      userCard:"",
      commits: [],
      languages: [],
      currentRepoCommits:"",
      items: ["Users", "Repositories" ],
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
        force: 300,
        nodeSize: 10,
        nodeLabels: true,
        linkWidth:3
      }     
  })
}
</script>