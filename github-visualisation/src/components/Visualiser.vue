<template> 
    <div class="vis">
    <h1> {{msg}} </h1>
    </div>
</template>

<script>
export default {
  name: 'Visualiser',
  props: {
    msg: String
  }
}
</script>