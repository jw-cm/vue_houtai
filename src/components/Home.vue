<!--  -->
<template>
  <div class>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  // 实现退出功能
  /* 基于token的方式实现退出比较简单,只需要销毁本地的token即可,这样后续的求情
    就不会携带token 必须重新登录生成一个token之后才可以访问页面 */
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页
      this.$router.push('/login')
    },
  },
}
</script>
<style lang="less" scoped>
</style>