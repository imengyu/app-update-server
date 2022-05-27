<template>
  <div>{{ result }}</div>
</template>

<script>
export default {
  name: "ShowInList",
  data() {
    return {
      result: ''
    }
  },
  props: {
    noMatchText: {
      default: '暂无',
      type: String
    },
    useProp: {
      default: true,
      type: Boolean
    },
    usePropName: {
      default: 'id',
      type: String
    },
    usePropValue: {
      default: 'name',
      type: String
    },
    list: {
      default: null,
      type: Array
    },
    value: {
      default: null,
    }
  },
  mounted: function() {
    this.loadText();
  },
  watch: {
    list() { this.loadText(); },
    value() { this.loadText(); }
  },
  methods: {
    loadText() {
      if(this.list && this.value && this.list.length > 0){
        for(let i = 0, c = this.list.length; i < c; i++){
          if(this.useProp)
            if(this.list[i][this.usePropName] == this.value) {
              this.result = this.list[i][this.usePropValue];
              return;
            }
          else
            if(this.list[i] == this.value) {
              this.result = this.list[i];
              return;
            }
        }
        this.result = this.noMatchText;
      }else this.result = this.noMatchText;
    }
  }
};
</script>