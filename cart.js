// import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';
// import userProductModal from './userProductModal.js'

//全域的宣告
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

                //命名, 內容
defineRule('required', required); //定義規則
defineRule('email', email);
defineRule('min', min); 
defineRule('max', max);

loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json'); //載入JSON檔案


configure({ // 用來做一些設定
    generateMessage: localize('zh_TW'), //啟用 locale 
    validateOnInput: true, // 輸入文字時馬上驗證 
  });
//

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'david-frontend';

const app = Vue.createApp({
    data(){
        return{
            cartData: {}, //購物車列表
            products: [], //產品列表
            productId: '', //2.新增productId
            isLoadingItem: '', //讀取效果
            form: {
                user: {
                  name: '',
                  email: '',
                  tel: '',
                  address: '',
                },
                message: '',
              },

        };
    },
    methods:{
        getProducts(){
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then((res) => {
                    console.log(res);
                    this.products = res.data.products;
                })
        },
        openProductModal(id){ //1.帶入id
            this.productId = id; //3.接收id存到productid裡面
            this.$refs.productModal.openModal();
        },
        getCart(){ //取得購物車內容
            axios.get(`${apiUrl}/api/${apiPath}/cart`) //改成get購物車的API
                .then((res) => {
                    console.log('購物車', res);
                    this.cartData = res.data.data; //把回傳資訊存起來
                })
        },
        addToCart(id,qty = 1){  //加入購物車
            //建構addToCart的資料格式
            const data = {
                product_id: id,
                qty,
            };
            this.isLoadingItem = id; //把id帶到變數isLoadingItem
            axios.post(`${apiUrl}/api/${apiPath}/cart`, {data}) //把資料格式帶進API的參數
                .then((res) => {
                    console.log('購物車', res);
                    this.getCart(); //加入購物車後重新取得購物車內容
                    this.$refs.productModal.closeModal(); //加入購物車後把內層model關掉
                    this.isLoadingItem = ''; //取完我們會把isLoadingItem 清空
                })
        },
        removeCartItem(id){
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`) //改成del購物車品項的API
                .then((res) => {
                    console.log('刪除購物車', res);
                    this.getCart(); //刪除購物車後重新取得購物車品項內容
                    this.isLoadingItem = ''; //取完我們會把isLoadingItem 清空
                })
        },
        updateCartItem(item){  //更新購物車數量
            //建構updateCartItem的資料格式
            const data = {
                product_id: item.id,
                qty: item.qty,
            };
            this.isLoadingItem = item.id; //把id帶到變數isLoadingItem
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, {data}) //改成put購物車品項的API
                .then((res) => {
                    console.log('put購物車', res);
                    this.getCart();
                    this.isLoadingItem = ''; 
                })
        },
        createOrder(){ //建立訂單
            const order = this.form;
            axios.post(`${apiUrl}/api/${apiPath}/order`, { data: order}) //改成post結帳的API
                .then((res) => {
                    alert('訂單已建立，請在一週內聯絡:0912345678預約刺青');
                    console.log('post結帳', res);
                    this.$refs.form.resetForm(); //防止送出後有紅字
                    this.getCart(); //重新取得購物車品項內容
                }).catch((err) => {
                    alert(err.data.message);
                });
        },
        deleteAllCarts(id){ //清空購物車
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/carts`) //改成del購物車品項的API(這是全部的)
                .then((res) => {
                    console.log('清空購物車', res);
                    this.getCart(); //刪除購物車後重新取得購物車品項內容
                    this.isLoadingItem = ''; //取完我們會把isLoadingItem 清空
                })
        },
    },
    //區域註冊
    components:{
        VForm: Form,
        VField: Field,
        ErrorMessage: ErrorMessage,
    },
    mounted(){
        this.getProducts();
        this.getCart();  //讓他一生成就跑getCart方法
    },
});

//refs
//product-modal元件
app.component('product-modal', {
    //5.使用props接收
    props:['id'],
    template: `#userProductModal`,
    data(){
        return{
            modal:{},
            product:{},
            qty: 1, //因為在購物車裡面所以至少會有1
        }
    },
    //使用watch監控id,id有變動就觸發
    watch:{
        id(){
            this.getProduct();
        }
    },
    //定義methods，他是拿來開啟或關閉modal
    methods: {
        openModal(){ 
            this.modal.show(); //改成this.modal
        },
        getProduct(){
            axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`) //改成單一品項的API
                .then((res) => {
                    console.log(res);
                    this.product = res.data.product;
                })
        },
        closeModal(){
            this.modal.hide(); //關閉modal
        },
        addToCart(){
            //console.log(this.qty);
            //使用emt觸發外層，自訂傳送名稱
            //帶入產品id 、 數量
            this.$emit('add-cart', this.product.id, this.qty);
        },
    },
    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal); //myModal改成this.modal
    },
})
app.mount('#app');