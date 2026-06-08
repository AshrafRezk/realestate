import fetch from 'node-fetch';

async function test() {
  const query = "SELECT Id, Name, Content_URL__c, Type__c, Location__c FROM PWA_Content__c WHERE Location__c = 'Homepage Hero Section' AND Type__c = 'Video'";
  // We can't easily call netlify functions if they are deployed and require auth or just local
  console.log("Looking at API client...");
}
test();
