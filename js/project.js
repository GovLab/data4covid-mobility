////////////////////////////////////////
// reload page after Forward and back
///////////////////////////////////////

const TYPE_BACK_FORWARD = 2;

function isReloadedPage() {
  return performance.navigation.type === TYPE_BACK_FORWARD;
}

function main() {
  if (isReloadedPage()) {
    window.location.reload();
  }
}
main();

////////////////////////////////////////////////////////////
///// TEAM  API REQUEST ` `
////////////////////////////////////////////////////////////

Vue.use(VueMeta);

new Vue({
    
  el: '#project-page',
    
  data () {
 
    return {
      filterData: [],
      mobilityData:[],
      indexData:[],
      apiURL: 'https://directus.thegovlab.com/data4covid',
    }
  },

  created: function created() {

    this.memberslug=window.location.href.split('?')[1];
    // this.memberslug = this.memberslug[this.memberslug.length - 1];
    console.log(this.memberslug);
    this.fetchIndex();
    this.fetchMobility();
  },
  methods: {

    fetchIndex() {
     
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "data4covid",
        storage: window.localStorage
      });

      client.getItems(
  'projects',
  {
    filter: {
      slug: self.memberslug
    },
    fields: ['*.*']
  }
).then(data => {
  
  self.filterData = data.data;
})
.catch(error => console.error(error));
    },
    fetchMobility() {
     
      self = this;
      const client = new DirectusSDK({
        url: "https://directus.thegovlab.com/",
        project: "data4covid",
        storage: window.localStorage
      });

      client.getItems(
        'mobility',
        {
          fields: ['*.*','project_name.*','project_name.thumbnail.*']
        }
      ).then(data => {
  
  self.indexData = data.data;
  self.mobilityData = self.indexData.filter(items => (items.project_name.title == self.filterData[0].title));
})
.catch(error => console.error(error));
    },
    dateShow(date) {
      return moment(date).format("MMMM YYYY");
    },
}});


