/**
 * 计算给定向量的正交向量。
 * 主要用于在二维平面上找到一个与给定向量垂直的方向。
 * 
 * @param v 输入的向量。
 * @return 返回与输入向量正交的向量。该向量在二维平面内垂直于输入向量。
 */
vec3 orthogonal(vec3 v){
    // 根据输入向量 v 的 x 和 z 分量的绝对值大小，选择合适的正交方向。
    return normalize(abs(v.x)>abs(v.z)?vec3(-v.y,v.x,0.)
    :vec3(0.,-v.z,v.y));
}

/**
 * 根据给定的位置、畸变位置、法向量和偏移量，修复法向量。
 * 该函数主要用于在纹理映射或几何变形后重新计算并校正法向量。
 * 
 * @param position 原始位置向量。
 * @param distortedPosition 畸变后的位置向量。
 * @param normal 原始法向量。
 * @param offset 偏移量，用于计算邻近位置。
 * @return 返回校正后的法向量。
 */
vec3 fixNormal(vec3 position,vec3 distortedPosition,vec3 normal,float offset){
    // 计算与法向量正交的两个向量（切向量和副切向量）。
    vec3 tangent=orthogonal(normal);
    vec3 bitangent=normalize(cross(normal,tangent));
    
    // 根据切向量和副切向量计算偏移后的位置。
    vec3 neighbour1=position+tangent*offset;
    vec3 neighbour2=position+bitangent*offset;
    
    // 应用畸变函数计算畸变后的邻近位置。
    vec3 displacedNeighbour1=distort(neighbour1);
    vec3 displacedNeighbour2=distort(neighbour2);
    
    // 计算从畸变位置到畸变后邻近位置的向量。
    vec3 displacedTangent=displacedNeighbour1-distortedPosition;
    vec3 displacedBitangent=displacedNeighbour2-distortedPosition;
    
    // 根据畸变后的切向量和副切向量计算并校正新的法向量。
    vec3 displacedNormal=normalize(cross(displacedTangent,displacedBitangent));
    
    return displacedNormal;
}