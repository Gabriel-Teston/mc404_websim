#include <stdio.h>
#include <stdlib.h>

#define SIZE 200000

// int globalMat[SIZE][SIZE];


void f1(int * v, int n){
  for (size_t i = 0; i < n; i++)
  {
    v[i] = rand() % 256;
  }
}

int f2(int *v, int n){
  int res = 0;
  for (size_t i = 0; i < n; i++)
  {
    if(1 || v[i] > 128){
      res += v[i];
    }
  }
  return res;
}

int main(int argc, char const *argv[]) {
  int a = 0, b = 0, localVet[SIZE];

  for (size_t i = 0; i < 50; i++)
  {
    f1(localVet, SIZE);
    a = f2(localVet, SIZE);
    printf("Res %d: %d\n", i, a);
  }


  // for (size_t i = 0; i < SIZE; i++)
  // {
  //   for (size_t j = 0; j < SIZE; j++)
  //   {
  //     globalMat[i][j] = rand() %256;
  //   }
  // }


  // for (size_t i = 0; i < SIZE; i++)
  // {
  //   for (size_t j = 0; j < SIZE; j++)
  //   {
  //     if(globalMat[i][j] > 128){
  //       b += globalMat[j][i];
  //     }
  //   }
  // }
  
  // printf("%d\n", b);
  return 0;
}
