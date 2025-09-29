// Jaro-Winkler (简化版)
function jaroWinkler(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    if (m === 0) return n === 0 ? 1 : 0;
    const matchDistance = Math.floor(Math.max(m, n)/2) - 1;
    let matches = 0;
    let hashS1 = Array(m).fill(false);
    let hashS2 = Array(n).fill(false);

    for (let i=0; i<m; i++) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(n-1, i + matchDistance);
        for (let j=start; j<=end; j++) {
            if (hashS2[j]) continue;
            if (s1[i] === s2[j]) {
                hashS1[i] = true;
                hashS2[j] = true;
                matches++;
                break;
            }
        }
    }
    if (matches === 0) return 0;

    let t = 0, k = 0;
    for (let i=0;i<m;i++){
        if(!hashS1[i]) continue;
        while(!hashS2[k]) k++;
        if(s1[i]!==s2[k]) t++;
        k++;
    }
    t /= 2;
    const jaro = ((matches/m) + (matches/n) + ((matches-t)/matches))/3;
    let l = 0;
    for(let i=0;i<Math.min(4,m,n);i++){
        if(s1[i]===s2[i]) l++; else break;
    }
    return jaro + l*0.1*(1-jaro);
}

// 核心函数
function computeScores() {
    const paraText = document.getElementById("paraText").value;
    const targetText = document.getElementById("targetText").value;
    const windowRatio = parseFloat(document.getElementById("windowRatio").value);
    const stepRatio = parseFloat(document.getElementById("stepRatio").value);

    const targetLen = targetText.length;
    const paraLen = paraText.length;
    if (!paraLen || !targetLen) return alert("请输入段落和目标文本");

    const windowLen = Math.max(1, Math.floor(targetLen * windowRatio));
    const step = Math.max(1, Math.floor(windowLen * stepRatio));

    let bestScore = 0, bestIndex = -1;
    let windowScores = [];

    // 遍历段落
    for (let i=0;i<=paraLen-windowLen;i+=step){
        const window = paraText.substring(i,i+windowLen);
        const score = jaroWinkler(window,targetText);
        windowScores.push({index:i,window,score});
        if(score>bestScore){
            bestScore=score;
            bestIndex=i;
        }
    }

    // 输出表格
    const tbody = document.querySelector("#scoreTable tbody");
    tbody.innerHTML = "";
    windowScores.forEach(ws=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${ws.index}</td><td>${ws.window}</td><td>${ws.score.toFixed(4)}</td>`;
        if(ws.index===bestIndex) tr.style.backgroundColor="#d1f7c4"; // 高亮
        tbody.appendChild(tr);
    });

    // 计算理论最优（窗口长度 = target length，步长=1）
    let theoBest=0;
    for(let i=0;i<=paraLen-targetLen;i++){
        const window=paraText.substring(i,i+targetLen);
        const score=jaroWinkler(window,targetText);
        if(score>theoBest) theoBest=score;
    }

    // 显示 Best Score 和理论最优
    document.getElementById("scoreSummary").innerHTML =
        `<strong>Best Score:</strong> ${bestScore.toFixed(4)} (index ${bestIndex}) &nbsp;&nbsp; | &nbsp;&nbsp;
         <strong>Theoretical Optimal Score:</strong> ${theoBest.toFixed(4)}`;
}
