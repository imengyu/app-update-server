import OSS from 'ali-oss';

export const aliOSSClient = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'yourRegion',
    // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
    accessKeyId: 'yourAccessKeyId',
    accessKeySecret: 'yourAccessKeySecret',
    // 从STS服务获取的安全令牌（SecurityToken）。
    stsToken: 'yourSecurityToken',
    refreshSTSToken: async () => {
    // 向您搭建的STS服务获取临时访问凭证。
      const info = await fetch('your_sts_server');
      return {
        accessKeyId: info.accessKeyId,
        accessKeySecret: info.accessKeySecret,
        stsToken: info.stsToken
      }
    },
    // 刷新临时访问凭证的时间间隔，单位为毫秒。
    refreshSTSTokenInterval: 300000,
    // 填写Bucket名称。
    bucket: 'examplebucket'
});