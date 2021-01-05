# GitHub-Metric-Visualisation-Project
This is a project built for my CSU33021 that visualises some data about a inputted users GitHub account.

# Running this Project
In the Dockerfile add your personal GitHub API key to the following line:
> ENV VUE_APP_API_KEY <INSERT_YOUR_PERSONAL_ACCESS_TOKEN_HERE> 

Then open a terminal and enter the following:

> docker build -t <your_image_name> .
> docker run -it -p 8080:8080 --rm <your_image_name>
>
