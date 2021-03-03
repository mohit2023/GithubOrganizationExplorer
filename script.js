const repoFinderForm = document.getElementById("repo-finder-form");
const organizationName = document.getElementById("organization-name");
const repoCount = document.getElementById("repo-count");
const committeeCount = document.getElementById("committee-count");
const popularRepoLists = document.getElementById("popular-repo-lists");
const popup = document.getElementById("popup");
const committeeList = document.getElementById("committee-list");
const popupRepository = document.getElementById("popup-repository");
const closePopup = document.getElementById("close-popup");
const loader = document.getElementById("loader");

let mostPopularRepos = [];


// fetch and displays top m committees name of given repo
async function getTopCommittee(repo, m){
  const response = await fetch(`https://api.github.com/repos/${repo}/contributors`);
  const data = await response.json();

  popupRepository.innerText = `${repo}`;
  committeeList.innerHTML = "";
  for(let i=0; i<data.length && i<m; i++){
    const li = document.createElement('li');
    
    li.classList.add("list-group-item");
    li.innerHTML = `
      <div>${i+1}: <a href="https://github.com/${data[i].login}" target="_blank">${data[i].login}</a> : ${data[i].contributions}</div>
    `;
    committeeList.appendChild(li);
  }
  popup.classList.add("show");
  document.body.classList.add("popup-open");
}


// displays fetched repos
function DisplayRepos(orgz, m){
  loader.classList.remove("show");
  for(let i=0; i<mostPopularRepos.length; i++){
    const div = document.createElement('div');

    div.innerHTML = `
      <div class="card m-4 shadow">
      <div class="card-body">
        <h5 class="card-title">${i+1}. ${mostPopularRepos[i].name}</h5>
          <div><a class="repo-link" href="https://github.com/${orgz}/${mostPopularRepos[i].name}" target="_blank">${orgz}/${mostPopularRepos[i].name}</a></div>
          <p class="card-text">${mostPopularRepos[i].description}</p>
          <p class="d-inline me-5">Forks: <strong>${mostPopularRepos[i].forkCount}</strong> </p>
          <button onclick="getTopCommittee('${orgz}/${mostPopularRepos[i].name}',${m})" class="view-committee btn-nostyle">View Contributors</button>
      </div>
      </div>
    `;
    popularRepoLists.appendChild(div);
  }

  if(mostPopularRepos.length > 0){
    popularRepoLists.classList.add("create-border");
  }
}

// Fetches the n most popular repos of given organization
async function findMostPopularRepos(orgz, n, m) {
  let pageNumber=1;
  let pushedRepoCount = 0;
  const numCalls = Math.floor(n/100) + ((n%100)==0? 0:1);

  while(pageNumber <= numCalls){
    const response = await fetch(`https://api.github.com/search/repositories?q=user:${orgz}&sort=forks&per_page=100&page=${pageNumber}`);
    const data = await response.json();
    
    if(data.message){
      alert("Organisation not found!!!");
      break;
    }
    if(data.items.length == 0){
      break;
    }

    for(let i=0; i<data.items.length && pushedRepoCount<n; i++){
      let repo = {
        name: data.items[i].name,
        forkCount: data.items[i].forks_count,
        description: data.items[i].description
      };

      mostPopularRepos.push(repo);
      pushedRepoCount++;
    }
    pageNumber++;
  }
  DisplayRepos(orgz, m);
}


/*-------- Event Listeners  -----------*/

// popup clicks
popup.addEventListener('click',(evt)=>{
  if(evt.path[0].classList.contains("overlay") || evt.path[0].classList.contains("close-popup")){
    committeeList.innerHTML = "";
    popup.classList.remove("show");
    document.body.classList.remove("popup-open");
  }
});

// form submit
repoFinderForm.addEventListener('submit', evt => {
  evt.preventDefault();

  popularRepoLists.classList.remove("create-border");
  popularRepoLists.innerHTML = "";
  loader.classList.add("show");

  mostPopularRepos = [];
  const orgz = organizationName.value;
  const n = repoCount.value;
  const m = committeeCount.value;

  findMostPopularRepos(orgz,n,m);
});