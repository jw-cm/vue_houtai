<!--  -->
<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 页面主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :router="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activePath"
        >
          <!-- 渲染一级菜单 -->
          <!-- 一级菜单 -->
          <!--这里的index只接受字符串,不接受数值 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 通过id 动态获取 data中提前定义的 icon图标  -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index=" '/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容主题 -->
      <el-main>
        <!--重定向 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// 在整个页面刚加载的时候,就立即获取左侧菜单  在行为区域定义一个生命周期函数
// 行为区域
export default {
  // 组件的私有数据  把获取到所有菜单数据立即挂载到自己的data中
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 在data中定义一个字体的对象 icon图标 在这个对象中以菜单项的id作为key
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao',
      },
      //与点击按钮连接 定义菜单是否折叠
      // 当触发按钮点击事件时,切换这个布尔值
      isCollapse: false,

      // 激活的连接地址 保存为空,切换时不冲突
      activePath: '',
    }
  },
  // 生命周期函数
  created() {
    this.getMenuList()
    // 当home组件一被创建的时候就立即从sessionStorage中把activePath这个值拿出来给他赋值,
    // 当他被创建的时候肯定会执行created生命周期函数
    this.activePath = window.sessionStorage.getItem('activePath')
  },
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
    //调用 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      console.log(this.$message)
      this.menulist = res.data
      console.log(res)
    },
    // 定义点击按钮切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态,颜色高亮
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
    },
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em; // 间距
  cursor: pointer;
}
</style>
