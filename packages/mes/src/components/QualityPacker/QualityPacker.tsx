import { defineComponent, defineProps, ref, Ref, nextTick, reactive, h, onMounted, getCurrentInstance, watch, onUnmounted, onActivated, onBeforeMount, unref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { label } from '@mmda/vui';

import { get } from 'http';
import { build } from 'vite';
import '@/assets/animate.min.css';
import { uiBuilder } from '@/mes';
import { emit } from 'process';


export default defineComponent({
	name: 'QualityPacker',
	// props: {
	//   // 当前实体上下文
	//   entityContext: Object
	// },
	props: { dateTime: String },
	emits: ['changeDateTime'],
	// emits: {
	// 	changeDateTime: (val: any) => val,
	// },
	setup(props, { emit }) {
		const ganttBox = ref();
		const apiBox = getCurrentInstance().appContext;
		const appConfig = getCurrentInstance().appContext.app.config;
		const { $ui: ui } = getCurrentInstance().appContext.app.config.globalProperties;
		const dateTime: any = ref(props.dateTime);

		onMounted(() => {
			console.log('props', props);
		});
		return () => (
			<div class="mainCon">
				<div class="searchTitle">
					<div>
						时间：
						{ui.factory.datePicker({
							modelValue: unref(dateTime), //toRefs
							hourFormat: 24,
							showTime: false,
							showSeconds: false,
							onUpdatePicker(value: any) {
								dateTime.value = value.toFormat('yyyy-MM-dd');
								console.log(dateTime.value, 'dateTime.value');
								this.isPanelVisible = false;
								emit('changeDateTime', value);
								//props.dateTime = value.toFormat('yyyy-MM-dd HH:mm:ss');
							},
						})}
					</div>
				</div>
			</div>

			//datePicker({
			// 	modelValue: subDate.value,
			// 	hourFormat:24,
			// 	showTime:true,
			// 	showSeconds:true,
			// 	onUpdatePicker(value: any) {
			// 		subDate.value = value.toFormat('yyyy-MM-dd HH:mm:ss');
			// 	},
			// }),
			// beforeConfirm: () => {
			// 	alert(subDate.value);
			// },

			// <el-container class="app-container deposit-operation">
			//   {showCountdown.value ? (
			//     <div class="showCountdown">
			//       {activePaymentMethods.value != 1 ? (
			//         <div class="lodingBx">
			//           <div class="lodingBx">
			//             <div class="el-loading-spinner">
			//               <svg class="circular" viewBox="0 0 50 50">
			//                 <circle class="path" cx="25" cy="25" r="20" fill="none"></circle>
			//               </svg>
			//             </div>
			//           </div>
			//           <div class={showCode.value}>
			//             <div class="countBox">
			//               <el-countdown
			//                 title="请在指定分钟内付款:"
			//                 value={countdown.value}
			//                 onFinish={overTime}
			//               />
			//             </div>
			//             <div class="closeBox">
			//               <i class="fal fa-times-circle closeType" onClick={closeMask}></i>
			//             </div>
			//           </div>
			//         </div>
			//       ) : (
			//         //wxCode_url.value
			//         <div>
			//           {qrCode.data.codeValue ? (
			//             <div class={showCode.value}>
			//               {ui.buildQrcode(qrCode.data)}
			//               <div class="countBox">
			//                 <el-countdown
			//                   title="请在指定分钟内付款:"
			//                   value={countdown.value}
			//                   onFinish={overTime}
			//                 />
			//               </div>
			//               <div class="closeBox">
			//                 <i class="fal fa-times-circle closeType" onClick={closeMask}></i>
			//               </div>
			//             </div>
			//           ) : (
			//             <div></div>
			//           )}
			//         </div>
			//       )}

			//       <div></div>
			//     </div>
			//   ) : (
			//     <div></div>
			//   )}

			//   <el-header class="flex flex-justify-start">
			//     {/* 边缘节点筛选 */}
			//     <div style="width: 240px">
			//       <el-select
			//         modelValue={edgePointValue.value}
			//         onChange={edgePointChange}
			//         filterable
			//         placeholder="选择边缘节点"
			//       >
			//         {edgePointData.value.map(({ label, value }) => (
			//           <el-option key={value} label={label} value={value} />
			//         ))}
			//       </el-select>
			//     </div>
			//     {depositTimeList.map((item, index) => (
			//       <el-button
			//         style={index == 0 ? 'margin-left: 12px' : ''}
			//         type={activeDepositTime.value == item.type ? 'primary' : ''}
			//         onClick={() => (activeDepositTime.value = item.type)}
			//         round
			//       >
			//         {item.label}
			//       </el-button>
			//     ))}
			//   </el-header>
			//   <div class="decviceNo">
			//     设备数量:共 <span class='allDec'> {paginationData.data?.recordCount ?? 0} </span> 台
			//     &nbsp; &nbsp; 单个设备价格: 低至<span class='allDec'> { 1 } </span> 元/天
			//   </div>

			//   <div class="pagination">
			//     <el-Pagination
			//       total={paginationData.data.recordCount}
			//       current-page ={ paginationData.data.pageNo}
			//       page-size = { paginationData.data.pageSize}
			//       page-sizes={[20, 50, 100]}
			//       layout="total, sizes, prev, pager, next, jumper"
			//       onCurrentChange={handleCurrentChange}
			//       onSizeChange={handleSizeChange}
			//     />
			//   </div>

			//   <el-main class='devListBox'>
			//     <el-table data={tableData.list} height="100%" style="width: 100%">
			//       {devicesMetaUi.value.map(({ listSize, fieldName, displayLabel, renderer }, index) => (
			//         <el-table-column
			//           fixed={index == 0 ? true : false}
			//           prop={fieldName}
			//           label={displayLabel}
			//           width={listSize}
			//         >
			//           {{
			//             default: ({ row }: any) =>
			//               renderer === 'Image' ? (
			//                 h(ElImage, {
			//                   '.id': fieldName,
			//                   src: row[fieldName],
			//                   loading: 'lazy',
			//                   class: 'ui-table-image'
			//                 })
			//               ) : fieldName === 'limitedTime' ? (
			//                 <div class="highlight">{row[fieldName]}</div>
			//               ) : (
			//                 <div>{row[fieldName]}</div>
			//               )
			//           }}
			//         </el-table-column>
			//       ))}
			//     </el-table>
			//   </el-main>
			//   <div class="pagination">
			//     <el-Pagination
			//       total={paginationData.data.recordCount}
			//       current-page ={ paginationData.data.pageNo}
			//       page-size = { paginationData.data.pageSize}
			//       page-sizes={[20, 50, 100]}
			//       layout="total, sizes, prev, pager, next, jumper"
			//       onCurrentChange={handleCurrentChange}
			//       onSizeChange={handleSizeChange}
			//     />
			//   </div>
			//   <el-footer height="150px">
			//     <h2 class="puy-text">支付方式</h2>
			//     <div class="puy-btn-box">
			//       {paymentMethods.map((item, index) => (
			//         <el-button
			//           style={{
			//             marginLeft: index != 0 ? '12px' : '',
			//             minWidth: '8rem'
			//           }}
			//           type={activePaymentMethods.value == item.type ? 'primary' : ''}
			//           size="large"
			//           onClick={() => (activePaymentMethods.value = item.type)}
			//         >
			//           {item.type == 1 ? (
			//             <svg
			//               // t="1716793655462"
			//               class="icon"
			//               viewBox="0 0 1228 1024"
			//               version="1.1"
			//               xmlns="http://www.w3.org/2000/svg"
			//               p-id="1272"
			//               width="20"
			//               height="20"
			//             >
			//               <path
			//                 d="M530.8928 703.1296a41.472 41.472 0 0 1-35.7376-19.8144l-2.7136-5.5808L278.272 394.752a18.7392 18.7392 0 0 1-2.048-8.1408 19.968 19.968 0 0 1 20.48-19.3536c4.608 0 8.8576 1.4336 12.288 3.84l234.3936 139.9296a64.4096 64.4096 0 0 0 54.528 5.9392L1116.2624 204.8C1004.9536 80.896 821.76 0 614.4 0 275.0464 0 0 216.576 0 483.6352c0 145.7152 82.7392 276.8896 212.2752 365.5168a38.1952 38.1952 0 0 1 17.2032 31.488 44.4928 44.4928 0 0 1-2.1504 12.3904l-27.6992 97.4848c-1.3312 4.608-3.328 9.3696-3.328 14.1312 0 10.752 9.216 19.3536 20.48 19.3536 4.4032 0 8.0384-1.536 11.776-3.584l134.5536-73.3184c10.1376-5.5296 20.7872-8.96 32.6144-8.96 6.2976 0 12.288 0.9216 18.0736 2.5088 62.72 17.0496 130.4576 26.5728 200.5504 26.5728C953.7024 967.168 1228.8 750.592 1228.8 483.6352c0-80.9472-25.4464-157.1328-70.0416-224.1024l-604.9792 436.992-4.4544 2.4064a42.1376 42.1376 0 0 1-18.432 4.1984z"
			//                 fill="#15BA11"
			//                 p-id="1273"
			//               ></path>
			//             </svg>
			//           ) : (
			//             <svg
			//               // t="1716793953499"
			//               class="icon"
			//               viewBox="0 0 1024 1024"
			//               version="1.1"
			//               xmlns="http://www.w3.org/2000/svg"
			//               p-id="1566"
			//               width="20"
			//               height="20"
			//             >
			//               <path
			//                 d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z"
			//                 fill="#009FE8"
			//                 p-id="1567"
			//               ></path>
			//             </svg>
			//           )}
			//           <span style="margin-left:5px">{item.label}</span>
			//         </el-button>
			//       ))}
			//     </div>

			//     <div class="flex-justify-between flex moneyBox">
			//       <div>
			//         <span class="puy-text">金额：</span>
			//         <span class="money-symbol">¥</span>
			//         <span class="pay-money">{amonut.value}</span>
			//       </div>
			//       <div>
			//         <el-button onClick={() => router.go(-1)} round>
			//           返回
			//         </el-button>

			//         {amonut.value > 0 ? (
			//           <el-button style="margin-left: 12px" type="primary" onClick={depositFn} round>
			//             充值
			//           </el-button>
			//         ) : (
			//           <div></div>
			//         )}
			//       </div>
			//     </div>
			//   </el-footer>
			// </el-container>
		);
	},
});
