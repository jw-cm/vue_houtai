import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welconme from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)

// const routes = [
//   { path: '/', redirect: '/login' },
//   { path: '/login', component: Login },
//   { path: '/home', component: Home },
// ]

const router = new VueRouter({
  routes: [
    // path: 路由规则地址  component: 指定要显示的组件
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    //重定向形式,只要访问/home地址,就重定向'/welcome 子路由规则
    {
      path: '/home', component: Home, redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welconme },
        { path: '/users', component: Users },
        { path: '/categories', component: Cate }
      ]
    },
  ]
});

// 挂载路由导航收卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数,表示放行
  //  next() 放行 next('/login) 强制跳转
  // 如果用户访问的登录页,直接放行
  if (to.path === '/login') return next();
  // 从sessionStorage中获取到保存的token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token 强制跳转登录页
  if (!tokenStr) return next('/login')
  next()
})
export default router