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
///// OFFLINE LOCAL JSON LOAD /////
////////////////////////////////////////////////////////////

Vue.use(VueMeta);

new Vue({
    
  el: '#project-page',
    
  data () {
 
    return {
      filterData: [],
      mobilityData:[],
      indexData:[],
    }
  },

  created: function created() {
    // Robustly extract the slug from the URL path (last non-empty segment)
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    this.memberslug = pathSegments[pathSegments.length - 1];
    console.log('Slug:', this.memberslug);
    this.fetchIndex();
    
  },
  methods: {

    fetchIndex() {
     
      self = this;
      // Look for the slug in the local JSON for all the projects. The slug is in self.memberslug.
      fetch('projects-local.json')
        .then(response => response.json())
        .then(data => {
          // Find the project(s) with the matching slug
          const filtered = data.data.filter(item => item.slug === self.memberslug);
          self.filterData = filtered;
          self.fetchMobility();
        })
        .catch(error => console.error('Error loading projects:', error));
    },
    fetchMobility() {
     
      self = this;
      // Load mobility data from local JSON
      fetch('mobility-projects-local.json')
        .then(response => response.json())
        .then(data => {
          self.indexData = data.data;
          
          // Filter mobility data to match the current project
          if (self.filterData.length > 0) {
            
            self.mobilityData = self.indexData.filter(items => 
              items.project_name && items.project_name.title === self.filterData[0].title
            );
          }
          console.log(self.mobilityData);
        })
        .catch(error => console.error('Error loading mobility data:', error));
    },
    dateShow(date) {
      return moment(date).format("MMMM YYYY");
    },
}});


