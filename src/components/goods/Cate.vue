<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>              <!-- 点击这个按钮 显示添加分类的对话框 -->
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格占位 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: lightgreen"></i>
        </template>

        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作模板 -->
        <template slot="opt" slot-scope>
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类 按钮的对话框 -->
    <el-dialog title="添加分类" 
    :visible.sync="addCateDialogVisible" 
    width="50%" 
    @close="addCateDialogClose">
      <!-- 添加分类的 对话框表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >                             <!-- prop验证规则 -->
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
<!-- 级联选择框  options用来指定数据源 props用来指定配置对象 clearable是否支持清空选项  change-on-select选择一个分类 -->
        <el-cascader   
            expand-trigger= "hover"
            :options="ParentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable 
            change-on-select
            >
        </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 添加分类对话框 按钮的点击 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件  商品分类数据列表
      querInfo: {
        type: 3,
        pagenum: 1, //当前页码值
        pagesize: 5, // 每页显示多少条数据
      },
      // 在生命周期函数里发起一次数据请求,当数据拿回来之后通过this赋值
      catelist: [], // 商品分类的数据列表,默认为空 ,
      total: 0, // 总数据条数
      columns: [
        {
          //为 table 指定列的定义
          label: '分类名称', //列标题名称
          prop: 'cat_name', //对应列内容的属性名
        },
        {
          label: '是否有效',
          type: 'template', // 表示将当前列定义为模板咧
          template: 'isok', // 表示当前这一列使用模板名称
        },
        {
          label: '排序',
          type: 'template', // 表示将当前列定义为模板咧
          template: 'order', // 表示当前这一列使用模板名称
        },
        {
          label: '操作',
          type: 'template', // 表示将当前列定义为模板咧
          template: 'opt', // 表示当前这一列使用模板名称
        },
      ],
      //   控制添加分类按钮对话框的显示
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm:{
        cat_name:'', //添加分类里的 分类名称
        cat_pid: 0,  // 父级分类的id   
        cat_level: 0 //当前分类的等级 0表示一级分类 默认1级   
      },
    // 添加分类表单的 校验规则 对象
      addCateFormRules:{
          cat_name: [
            {required:true, message:'请输入分类名称', trigger:'blur'}
          ]
      },
      // 父级分类的列表
      ParentCateList: [],
      // 指定级联选择器的配置选项
      cascaderProps:{
          value: 'cat_id',  // 指定具体选中的哪个值得属性
          label: 'cat_name',  // 指定具体看到的是哪个属性
          children: 'children'  //指定父子嵌套用的是哪个属性
      },
      // 选中的父级分类 显示二级三级的id数组
      selectedKeys: [],
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    // 获取商品分类数据   同时也涉及到了分页,在数据里面在添加一个数据
    async getCateList() {
      // params 指定查询参数
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      console.log(res.data)
      //上面打印res.data 获取到的是一个{total: 30, pagenum: 0, pagesize: 5, result: Array(5)}
      // 把数据列表, 赋值给 catelist
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize (每页显示多少条数据) 改变的事件
    handleSizeChange(newSize) {
      // 在这个事件中,可以拿到最新的pagesize值 都可以把他立即赋值给data中querInfo的pagesize值
      this.querInfo.pagesize = newSize
      // pagesize 改变了,立即刷新数据 (也就是调用获取商品分类数据事件) 发起一次请求
      this.getCateList()
    },
    // 监听 pagenum(当前页码值) 改变
    handleCurrentChange(newPage) {
      // 触发这个事件,就可以拿到罪业的页码值 立即给 pagenum 赋值
      this.querInfo.pagenum = newPage
      // 赋值之后立即刷新数据列表
      this.getCateList()
    },
    // 点击添加分类按钮, 显示添加分类的对话框
    showAddCateDialog() {
        // 先获取父级分类的数据列表,然后
      this.getParentCateList()
      // 在展示出 对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {            // 同时要指定一个get参数,用params来指定参数
        const { data: res} = await this.$http.get('categories', {params:
        {type:2,}})  //type 代表获取前两级的所有分类
        if(res.meta.status !== 200) {
            return this.$message.error('获取父级分类数据失败')
        }
        console.log(res.data)
    // 把获取到的父级分类列表赋值给 data数据中定义的 ParentCateList    
        this.ParentCateList = res.data
    },
    // 父级分类里的选择项发生变化触发这个函数
    parentCateChanged() {
        console.log(this.selectedKeys)
        // 如果selectedKeys 数据中的length 大于0 证明选中了父级分类
        // 反之,就说明没有选中任何父级分类
        if(this.selectedKeys.length > 0) {
        // 父级分类的id    id数组大于0 
           this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        //  为当前分类的等级赋值
           this.addCateForm.cat_level = this.selectedKeys.length
           return 
        }else{
            // 如果等于0,就说明没有选中任何父级分类
            this.addCateForm.cat_pid = 0  // 父级分类的id   
            this.addCateForm.cat_level = 0  //当前分类的等级 0表示一级分类 默认1级   
        }
    },
    // 点击按钮,添加新的分类
    addCate() {
        console.log(this.addCateForm) 
//拿到表单数据,进行验证 调用一个方法 validate 需要定义一个回调函数 返回的数据是promise
        this.$refs.addCateFormRef.validate(async valid => {
            if(!valid) return  //非valid就是验证失败
//验证通过就发请求来添加这个分类 数据  请求体是addCateForm数据对象        
            const {data:res} = await this.$http.post('categories', this.addCateForm)
            if(res.meta.status !== 201){
                return this.$message.error('添加分类失败')
            }
            this.$message.success('添加分类成功')
            this.getCateList() //刷新商品分类数据
            this.addCateDialogVisible = false // 隐藏添加分类的对话框
        })
    },
    // 监听添加分类对话框的关闭事件,重置表单数据
    addCateDialogClose() {
        this.$refs.addCateFormRef.resetFields() // 点击取消 清空分类名称表单的数据
        this.selectedKeys = [] // 清空 选中的父级分类 显示二级三级的id数组
        this.addCateForm.cat_level = 0 // 重置 当前分类的等级 0表示一级分类 默认1级   
        this.addCateForm.cat_pid = 0 // 重置 父级分类的id
    },
  },
}     
        
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>
