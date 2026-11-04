import SwiftUI
import Combine

// MARK: - ViewModel - Fixed to conform to ObservableObject
class BlueMonkeyViewModel: ObservableObject {
    @Published var name = ""
    @Published var email = ""
    @Published var phone = ""
    @Published var userId: String?
    @Published var cardLastFour: String?
    @Published var isLoading = false
    @Published var transactions: [Tx] = []
    
    let backendURL = "http://localhost:3000" // Change to Fly.io URL in production
    
    struct Tx: Identifiable {
        let id: String
        let merchant: String
        let amount: Int
        let bananas: Int
    }
    
    func signup() async {
        await MainActor.run { isLoading = true }
        // Mock for Spring Branch testing - works without backend
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        await MainActor.run {
            self.userId = "user_mock_\(Int.random(in: 1000...9999))"
            self.isLoading = false
        }
    }
    
    func deposit(amountCents: Int) async {
        await MainActor.run { isLoading = true }
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        await MainActor.run {
            self.cardLastFour = "1967"
            self.isLoading = false
            self.transactions = [
                Tx(id: "1", merchant: "H-E-B Spring Branch", amount: 500, bananas: 5),
                Tx(id: "2", merchant: "Buc-ee's New Braunfels", amount: 1200, bananas: 12)
            ]
        }
    }
}

// MARK: - Main ContentView
struct ContentView: View {
    @StateObject private var vm = BlueMonkeyViewModel()
    @State private var step = 1
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.97, green: 0.98, blue: 1.0).ignoresSafeArea()
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Text("🐒").font(.system(size: 30))
                        Text("BLUE MONKEY CARD")
                            .font(.system(size: 18, weight: .black, design: .rounded))
                            .foregroundColor(Color(red: 0.176, green: 0.498, blue: 0.976))
                        Spacer()
                        Text("Secured • Visa")
                            .font(.system(size: 10, weight: .bold))
                            .padding(6)
                            .background(Color(red: 1, green: 0.839, blue: 0.039))
                            .cornerRadius(8)
                    }
                    .padding()
                    
                    // Progress dots
                    HStack(spacing: 8) {
                        ForEach(1...4, id: \.self) { i in
                            Circle()
                                .fill(i <= step ? Color(red: 0.176, green: 0.498, blue: 0.976) : Color.gray.opacity(0.2))
                                .frame(width: 12, height: 12)
                        }
                    }
                    .padding(.bottom, 20)
                    
                    TabView(selection: $step) {
                        SignupView(vm: vm, step: $step).tag(1)
                        IDVerifyView(vm: vm, step: $step).tag(2)
                        DepositView(vm: vm, step: $step).tag(3)
                        CardSuccessView(vm: vm).tag(4)
                    }
                    .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                    .animation(.easeInOut, value: step)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

// MARK: - Steps
struct SignupView: View {
    @ObservedObject var vm: BlueMonkeyViewModel
    @Binding var step: Int
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Your bank is boring.\nBlue is not.")
                .font(.system(size: 28, weight: .black, design: .rounded))
            Text("The blue metal Visa that builds credit while you stack Bananas. Spring Branch, TX.")
                .foregroundColor(.gray)
                .font(.subheadline)
            
            VStack(spacing: 12) {
                TextField("Full Name", text: $vm.name)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                TextField("Email", text: $vm.email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                TextField("Phone (512)", text: $vm.phone)
                    .keyboardType(.phonePad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
            
            Button(action: {
                Task {
                    await vm.signup()
                    if vm.userId != nil { step = 2 }
                }
            }) {
                HStack {
                    if vm.isLoading { ProgressView().tint(.white) }
                    Text("Continue • Ooo-ooo!")
                        .bold()
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(red: 0.176, green: 0.498, blue: 0.976))
                .foregroundColor(.white)
                .cornerRadius(16)
            }
            .disabled(vm.name.isEmpty || vm.email.isEmpty)
            
            Spacer()
        }
        .padding()
    }
}

struct IDVerifyView: View {
    @ObservedObject var vm: BlueMonkeyViewModel
    @Binding var step: Int
    var body: some View {
        VStack(spacing: 20) {
            Text("Verify it's you").font(.title2.bold())
            Text("Security Service FCU member check + Persona mock for Lead Bank.").foregroundColor(.gray).multilineTextAlignment(.center).font(.caption)
            RoundedRectangle(cornerRadius: 16).fill(Color.gray.opacity(0.1)).frame(height: 200).overlay(VStack { Image(systemName: "person.crop.rectangle.stack").font(.system(size: 50)); Text("Tap to scan TX DL").font(.caption) })
            Button("Verified ✓ Mock Pass") { step = 3 }
                .frame(maxWidth: .infinity).padding().background(Color(red: 1, green: 0.839, blue: 0.039)).foregroundColor(.black).cornerRadius(16).bold()
            Spacer()
        }.padding()
    }
}

struct DepositView: View {
    @ObservedObject var vm: BlueMonkeyViewModel
    @Binding var step: Int
    @State private var amount: Double = 200
    var body: some View {
        VStack(spacing: 20) {
            Text("Fund your Blue Card").font(.title2.bold())
            Text("Deposit $100-$1000 = Limit. Secured, FDIC via Lead Bank.").foregroundColor(.gray).font(.caption).multilineTextAlignment(.center)
            VStack {
                Text("$\(Int(amount))").font(.system(size: 48, weight: .black)).foregroundColor(Color(red: 0.176, green: 0.498, blue: 0.976))
                Slider(value: $amount, in: 100...1000, step: 50).tint(Color(red: 0.176, green: 0.498, blue: 0.976))
                HStack { Text("$100"); Spacer(); Text("$1000") }.font(.caption).foregroundColor(.gray)
            }.padding().background(.white).cornerRadius(20).shadow(radius: 3)
            HStack { Text("🍌 Bananas earned:"); Spacer(); Text("\(Int(amount)) Bananas").bold() }.padding().background(Color(red: 1, green: 0.839, blue: 0.039).opacity(0.3)).cornerRadius(12)
            Button(action: { Task { await vm.deposit(amountCents: Int(amount * 100)); if vm.cardLastFour != nil { step = 4 } } }) {
                HStack { if vm.isLoading { ProgressView() }; Text("Create My Blue Card • $\(Int(amount))").bold() }
                .frame(maxWidth: .infinity).padding().background(Color(red: 0.176, green: 0.498, blue: 0.976)).foregroundColor(.white).cornerRadius(16)
            }
            Text("Powered by Lithic + Lead Bank. Deposits held in FBO.").font(.system(size: 9)).foregroundColor(.gray)
            Spacer()
        }.padding()
    }
}

struct CardSuccessView: View {
    @ObservedObject var vm: BlueMonkeyViewModel
    var body: some View {
        VStack(spacing: 20) {
            Text("Ooo-ooo! Approved!").font(.system(size: 28, weight: .black))
            Text("Blue is swinging from Spring Branch!").foregroundColor(.gray).font(.subheadline)
            ZStack {
                RoundedRectangle(cornerRadius: 16).fill(Color(red: 0.176, green: 0.498, blue: 0.976)).frame(height: 200).shadow(radius: 10)
                VStack(alignment: .leading) {
                    HStack { Text("🐒").font(.system(size: 40)); Spacer(); Text("VISA").font(.title.bold()).foregroundColor(.white) }
                    Spacer()
                    Text("•••• •••• •••• \(vm.cardLastFour ?? "1967")").font(.system(.title3, design: .monospaced)).foregroundColor(.white.opacity(0.9))
                    Text(vm.name.uppercased()).font(.caption.bold()).foregroundColor(.white.opacity(0.8))
                    Text("BLUE MONKEY CARD • SPRING BRANCH, TX").font(.system(size: 9, weight: .bold)).foregroundColor(Color(red: 1, green: 0.839, blue: 0.039))
                }.padding()
            }.padding(.horizontal)
            Button(action: {}) {
                HStack { Image(systemName: "applelogo"); Text("Add to Apple Pay") }.frame(maxWidth: .infinity).padding().background(.black).foregroundColor(.white).cornerRadius(16)
            }.padding(.horizontal)
            if !vm.transactions.isEmpty {
                List(vm.transactions.prefix(3), id: \.id) { tx in
                    HStack { Text(tx.merchant).font(.caption); Spacer(); Text("-$\(tx.amount / 100)").font(.caption2); Text("+\(tx.bananas)🍌").font(.caption2) }
                }.frame(height: 120)
            }
            Spacer()
        }.padding()
    }
}
